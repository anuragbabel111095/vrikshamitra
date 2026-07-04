"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp, Language, FarmerProfile } from "@/context/AppContext";
import { Mic, MicOff, Send, Volume2, VolumeX, Upload, RefreshCw, Sparkles, Check, ArrowRight } from "lucide-react";
import Link from "next/router";
import { useRouter } from "next/navigation";
import districtsData from "@/data/districts.json";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  isVoice?: boolean;
  options?: string[] | { label: string; value: string }[];
  inputType?: "select" | "number" | "multiselect" | "district" | "soil_upload" | "none";
  optionsSelected?: string[];
}

export default function ChatPage() {
  const router = useRouter();
  const { language, profile, updateProfile, t, clearPlan } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome/district, 1 = taluka, 2 = land, 3 = soil, 4 = water, 5 = crops, 6 = goals, 7 = finished
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // TTS readout toggle
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [landUnit, setLandUnit] = useState<"acre" | "bigha" | "hectare">("acre");
  const [landSizeVal, setLandSizeVal] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        // Match active language locale
        rec.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN";
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        
        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInputVal(text);
          // Auto send voice message if it is free text
          if (currentStep >= 7) {
            handleSendMessage(text);
          }
        };

        rec.onerror = (err: any) => {
          console.error("Speech Recognition Error:", err);
          setIsListening(false);
        };
        recognitionRef.current = rec;
      }
    }
  }, [language, currentStep]);

  // Set language on recognition when language state changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN";
    }
  }, [language]);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !voiceEnabled) return;
    window.speechSynthesis.cancel(); // stop current reading
    
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-US";
    utt.rate = 0.9; // Farmer friendly speed
    
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    
    synthesisUtteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Initialize Chat guided flow
  useEffect(() => {
    // If profile is already filled partially, let the user start from where they left or restart
    const hasExistingProfile = profile.district && profile.soilType;
    
    const welcomeMsg = t("chat_welcome");
    setMessages([
      {
        id: "msg-welcome",
        sender: "bot",
        text: welcomeMsg,
      }
    ]);
    
    // Trigger speaking welcome message
    setTimeout(() => {
      speakText(welcomeMsg);
    }, 1000);

    // Initial district options list
    askDistrictQuestion();
  }, [language]);

  const askDistrictQuestion = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: "msg-district",
        sender: "bot",
        text: t("question_district"),
        inputType: "district",
        options: districtsData.map((d) => d.name)
      }
    ]);
    setCurrentStep(0);
  };

  const handleDistrictSelect = (districtName: string) => {
    setSelectedDistrict(districtName);
    updateProfile({ district: districtName });

    // Append user selection as chat bubble
    setMessages((prev) => [
      ...prev,
      { id: `user-dist-${Date.now()}`, sender: "user", text: districtName }
    ]);

    // Go to next step (taluka)
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const district = districtsData.find((d) => d.name === districtName);
      const talukas = district ? district.talukas : [];
      
      const text = t("question_taluka");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-taluka-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "select",
          options: talukas
        }
      ]);
      speakText(text);
      setCurrentStep(1);
    }, 800);
  };

  const handleTalukaSelect = (talukaName: string) => {
    setSelectedTaluka(talukaName);
    updateProfile({ taluka: talukaName });

    setMessages((prev) => [
      ...prev,
      { id: `user-taluka-${Date.now()}`, sender: "user", text: talukaName }
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const text = t("question_land");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-land-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "number"
        }
      ]);
      speakText(text);
      setCurrentStep(2);
    }, 800);
  };

  const handleLandSubmit = (size: number, unit: "acre" | "bigha" | "hectare") => {
    updateProfile({ landSize: size, landUnit: unit });

    setMessages((prev) => [
      ...prev,
      { id: `user-land-${Date.now()}`, sender: "user", text: `${size} ${unit === "bigha" ? "Bigha" : unit === "hectare" ? "Hectare" : "Acre"}` }
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const text = t("question_soil");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-soil-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "soil_upload",
          options: [
            { label: t("soil_loamy"), value: "loamy" },
            { label: t("soil_black_cotton"), value: "black_cotton" },
            { label: t("soil_sandy"), value: "sandy" },
            { label: t("soil_saline"), value: "saline" },
            { label: t("soil_clayey"), value: "clayey" }
          ]
        }
      ]);
      speakText(text);
      setCurrentStep(3);
    }, 800);
  };

  const handleSoilSelect = (soilVal: string, soilLabel: string) => {
    updateProfile({ soilType: soilVal });

    setMessages((prev) => [
      ...prev,
      { id: `user-soil-${Date.now()}`, sender: "user", text: soilLabel }
    ]);

    askWaterQuestion();
  };

  const askWaterQuestion = () => {
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const text = t("question_water");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-water-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "select",
          options: [
            { label: t("water_rainfed"), value: "rainfed" },
            { label: t("water_well"), value: "well" },
            { label: t("water_canal"), value: "canal" },
            { label: t("water_drip"), value: "drip" }
          ]
        }
      ]);
      speakText(text);
      setCurrentStep(4);
    }, 800);
  };

  const handleWaterSelect = (waterVal: string, waterLabel: string) => {
    updateProfile({ waterSource: waterVal });

    setMessages((prev) => [
      ...prev,
      { id: `user-water-${Date.now()}`, sender: "user", text: waterLabel }
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const text = t("question_crops");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-crops-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "multiselect",
          options: [
            { label: t("crop_cotton"), value: "cotton" },
            { label: t("crop_groundnut"), value: "groundnut" },
            { label: t("crop_wheat"), value: "wheat" },
            { label: t("crop_bajra"), value: "bajra" },
            { label: t("crop_mustard"), value: "mustard" },
            { label: t("crop_pulses"), value: "pulses" },
            { label: t("crop_sugarcane"), value: "sugarcane" }
          ]
        }
      ]);
      speakText(text);
      setCurrentStep(5);
    }, 800);
  };

  const handleCropsSubmit = () => {
    updateProfile({ currentCrops: selectedCrops });
    
    const cropNames = selectedCrops.map(c => t(`crop_${c}`)).join(", ") || "None";
    setMessages((prev) => [
      ...prev,
      { id: `user-crops-${Date.now()}`, sender: "user", text: cropNames }
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const text = t("question_goals");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-goals-${Date.now()}`,
          sender: "bot",
          text,
          inputType: "multiselect",
          options: [
            { label: t("goal_fodder"), value: "fodder" },
            { label: t("goal_fuelwood"), value: "fuelwood" },
            { label: t("goal_income"), value: "income" },
            { label: t("goal_soil_improvement"), value: "soil_improvement" },
            { label: t("goal_shade"), value: "shade" },
            { label: t("goal_fruit"), value: "fruit" }
          ]
        }
      ]);
      speakText(text);
      setCurrentStep(6);
    }, 800);
  };

  const handleGoalsSubmit = () => {
    updateProfile({ goals: selectedGoals });

    const goalNames = selectedGoals.map(g => t(`goal_${g}`)).join(", ") || "None";
    setMessages((prev) => [
      ...prev,
      { id: `user-goals-${Date.now()}`, sender: "user", text: goalNames }
    ]);

    setIsBotTyping(true);
    // Simulate thinking animation
    setTimeout(() => {
      setIsBotTyping(false);
      const completionText = language === "gu"
        ? "તમારી પ્રોફાઇલ સફળતાપૂર્વક સાચવવામાં આવી છે! મેં તમારી જમીન, પાક અને જરૂરિયાત અનુસાર શ્રેષ્ઠ વૃક્ષો શોધી લીધા છે. નીચે બટન દબાવી ભલામણ કરેલ વૃક્ષો જુઓ અથવા મને કોઈ પણ સવાલ પૂછો!"
        : language === "hi"
        ? "आपकी प्रोफ़ाइल सफलतापूर्वक सहेज ली गई है! मैंने आपके स्थान, मिट्टी और फसलों के अनुकूल सर्वोत्तम पेड़ खोज लिए हैं। नीचे दिए गए बटन पर क्लिक करें या मुझसे कोई अन्य प्रश्न पूछें!"
        : "Profile successfully saved! I have analyzed your crops and soil to match the best species. Tap below to see your recommendations or type any custom questions!";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-finish-${Date.now()}`,
          sender: "bot",
          text: completionText,
          inputType: "none"
        }
      ]);
      speakText(completionText);
      setCurrentStep(7);
    }, 1500);
  };

  // Simulate Soil Photo upload
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const handlePhotoUpload = () => {
    setIsPhotoUploading(true);
    setTimeout(() => {
      setIsPhotoUploading(false);
      // Guess loamy soil
      handleSoilSelect("loamy", t("soil_loamy") + " (AI photo guess)");
    }, 1500);
  };

  // Trigger Speech-to-text
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking();
      recognitionRef.current?.start();
    }
  };

  // Free text Q&A with Gemini API Integration
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim()) return;

    // Clear input
    if (!customText) setInputVal("");

    // Stop reading previous bot messages
    stopSpeaking();

    // Add user message to chat history
    setMessages((prev) => [
      ...prev,
      { id: `user-query-${Date.now()}`, sender: "user", text: textToSend }
    ]);

    setIsBotTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language,
          profile
        }),
      });

      const data = await response.json();
      setIsBotTyping(false);

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: `bot-reply-${Date.now()}`, sender: "bot", text: data.reply }
        ]);
        speakText(data.reply);
      } else {
        const errorReply = language === "gu"
          ? "માફ કરજો, સર્વર જોડાણમાં ભૂલ આવી. કૃપા કરીને થોડીવાર પછી ફરીથી પ્રયાસ કરો."
          : language === "hi"
          ? "क्षमा करें, सर्वर त्रुटि हुई। कृपया थोड़ी देर बाद पुनः प्रयास करें।"
          : "Sorry, I encountered an issue connecting. Please try again in a moment.";
        setMessages((prev) => [
          ...prev,
          { id: `bot-reply-${Date.now()}`, sender: "bot", text: errorReply }
        ]);
        speakText(errorReply);
      }
    } catch (err) {
      console.error("Failed to fetch response:", err);
      setIsBotTyping(false);
      const fallbackReply = language === "gu"
        ? "માફ કરજો, જોડાણમાં સમસ્યા આવી. કૃપા કરીને તમારું ઇન્ટરનેટ ચેક કરો."
        : language === "hi"
        ? "कनेक्शन की समस्या। कृपया इंटरनेट की जांच करें।"
        : "Network issue. Please check your internet connection and try again.";
      setMessages((prev) => [
        ...prev,
        { id: `bot-reply-${Date.now()}`, sender: "bot", text: fallbackReply }
      ]);
      speakText(fallbackReply);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] bg-stone-50 border border-emerald-900/10 rounded-2xl shadow-inner relative overflow-hidden">
      
      {/* Settings / Floating Bar */}
      <div className="bg-emerald-950 text-amber-50 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-sm md:text-base tracking-wide">VrikshaMitra Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (voiceEnabled) stopSpeaking();
            }}
            className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold ${
              voiceEnabled ? "bg-amber-500 text-stone-900" : "bg-emerald-900 hover:bg-emerald-800 text-stone-300"
            }`}
            title="Read answers aloud (TTS)"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{voiceEnabled ? "Read Aloud On" : "Muted"}</span>
          </button>
          
          <button
            onClick={() => {
              clearPlan();
              window.location.reload();
            }}
            className="p-2 bg-emerald-900 hover:bg-emerald-800 text-stone-300 rounded-full transition-colors text-xs flex items-center gap-1 font-semibold"
            title="Reset profiling flow"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? "items-start" : "items-end"} w-full`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  isBot
                    ? "bg-white text-stone-800 rounded-tl-none border border-stone-200/60"
                    : "bg-emerald-850 text-amber-50 rounded-tr-none"
                }`}
                style={!isBot ? { backgroundColor: "#022c22" } : {}}
              >
                <p className="text-sm md:text-base leading-relaxed font-semibold whitespace-pre-line">{msg.text}</p>
                
                {isBot && voiceEnabled && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="mt-2 text-stone-400 hover:text-emerald-900 transition-colors p-1"
                    title="Speak this bubble"
                  >
                    <Volume2 className="w-4 h-4 inline" />
                  </button>
                )}
              </div>

              {/* Dynamic Action Controls for Guided Profiling */}
              {isBot && msg.inputType && msg.inputType !== "none" && (
                <div className="mt-2 flex flex-wrap gap-2 w-full max-w-[90%] pt-1">
                  
                  {/* Select Options / Autocomplete */}
                  {msg.inputType === "select" && msg.options && (msg.options as any[]).map((opt) => {
                    const label = typeof opt === "string" ? opt : opt.label;
                    const val = typeof opt === "string" ? opt : opt.value;
                    return (
                      <button
                        key={val}
                        onClick={() => {
                          if (currentStep === 1) handleTalukaSelect(val);
                          else if (currentStep === 4) handleWaterSelect(val, label);
                        }}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 active:bg-emerald-950 active:text-amber-50 text-emerald-950 font-bold border border-emerald-950/10 text-sm rounded-full transition-all"
                      >
                        {label}
                      </button>
                    );
                  })}

                  {/* District Auto-Complete Grid */}
                  {msg.inputType === "district" && msg.options && (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 w-full">
                      {(msg.options as string[]).map((dist) => (
                        <button
                          key={dist}
                          onClick={() => handleDistrictSelect(dist)}
                          className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-emerald-950 font-semibold text-xs md:text-sm rounded-xl transition-all shadow-sm text-center"
                        >
                          {dist}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Numeric Land Size Input */}
                  {msg.inputType === "number" && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3 shadow-md w-full max-w-sm">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={landSizeVal}
                          onChange={(e) => setLandSizeVal(e.target.value)}
                          placeholder="e.g. 5"
                          className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-700 focus:outline-emerald-850"
                        />
                        <select
                          value={landUnit}
                          onChange={(e) => setLandUnit(e.target.value as any)}
                          className="bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-stone-700 font-semibold focus:outline-emerald-850"
                        >
                          <option value="acre">{t("landUnit_acre") || "Acre"}</option>
                          <option value="bigha">{t("landUnit_bigha") || "Bigha"}</option>
                          <option value="hectare">{t("landUnit_hectare") || "Hectare"}</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const size = parseFloat(landSizeVal);
                          if (!isNaN(size) && size > 0) {
                            handleLandSubmit(size, landUnit);
                          }
                        }}
                        disabled={!landSizeVal || parseFloat(landSizeVal) <= 0}
                        className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-bold py-2 rounded-xl transition-colors disabled:opacity-40"
                      >
                        {t("submit")}
                      </button>
                    </div>
                  )}

                  {/* Soil Selection + Photo Upload Simulation */}
                  {msg.inputType === "soil_upload" && msg.options && (
                    <div className="flex flex-col gap-3 w-full max-w-md bg-white border border-stone-200 rounded-2xl p-4 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        {(msg.options as any[]).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSoilSelect(opt.value, opt.label)}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 text-stone-700 hover:text-emerald-950 font-bold text-xs rounded-xl transition-all text-left"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                        <span className="text-xs text-stone-400 font-medium">Unsure of soil?</span>
                        <button
                          onClick={handlePhotoUpload}
                          disabled={isPhotoUploading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/10 hover:bg-emerald-900/20 active:bg-emerald-850 active:text-amber-50 text-emerald-950 rounded-xl text-xs font-bold transition-all border border-emerald-950/10 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isPhotoUploading ? "Analyzing photo..." : t("soil_photo_btn")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Multi-Select Crops/Goals with Checklist */}
                  {msg.inputType === "multiselect" && msg.options && (
                    <div className="flex flex-col gap-3 w-full max-w-sm bg-white border border-stone-200 rounded-2xl p-4 shadow-md">
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {(msg.options as any[]).map((opt) => {
                          const isCrops = currentStep === 5;
                          const isSelected = isCrops
                            ? selectedCrops.includes(opt.value)
                            : selectedGoals.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-emerald-900/5 border-emerald-850/30 text-emerald-950"
                                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isCrops) {
                                      setSelectedCrops((prev) =>
                                        prev.includes(opt.value)
                                          ? prev.filter((v) => v !== opt.value)
                                          : [...prev, opt.value]
                                      );
                                    } else {
                                      setSelectedGoals((prev) =>
                                        prev.includes(opt.value)
                                          ? prev.filter((v) => v !== opt.value)
                                          : [...prev, opt.value]
                                      );
                                    }
                                  }}
                                  className="accent-emerald-950 w-4 h-4 cursor-pointer"
                                />
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-850 stroke-[3px]" />}
                            </label>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => {
                          if (currentStep === 5) handleCropsSubmit();
                          else if (currentStep === 6) handleGoalsSubmit();
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-bold py-2 rounded-xl transition-colors text-sm"
                      >
                        {t("submit")}
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}

        {/* Bot Typing indicator */}
        {isBotTyping && (
          <div className="flex flex-col items-start w-full">
            <div className="bg-white border border-stone-200 text-stone-400 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {/* Recommendation redirection panel */}
        {currentStep >= 7 && (
          <div className="w-full max-w-md mx-auto bg-amber-50 border border-amber-900/10 rounded-2xl p-4 shadow-md flex flex-col items-center text-center gap-3 animate-fade-in">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h3 className="font-extrabold text-emerald-950">{t("rec_title")}</h3>
            <p className="text-xs text-stone-600 leading-normal font-medium">
              We have matches ready for {profile.district}! Let's explore suitable species.
            </p>
            <button
              onClick={() => router.push("/species")}
              className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-sm"
            >
              See My Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Custom text/voice input bar */}
      <div className="p-3 bg-white border-t border-emerald-900/10 flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full transition-colors flex items-center justify-center shrink-0 ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-950"
          }`}
          title={isListening ? t("speak_prompt") : "Click to speak"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder={t("input_placeholder")}
          className="flex-1 bg-stone-50 border border-stone-300/80 rounded-full px-4 py-2.5 text-sm text-stone-700 focus:outline-emerald-850"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputVal.trim()}
          className="p-3 bg-emerald-850 hover:bg-emerald-900 active:bg-emerald-950 text-amber-50 rounded-full transition-colors shrink-0 disabled:opacity-40"
          style={{ backgroundColor: "#022c22" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  );
}
