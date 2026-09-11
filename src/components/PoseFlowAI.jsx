import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Shirt, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Zap,
  RefreshCcw,
  Copy,
  Layout,
  ScanSearch,
  Users,
  X,
  Check,
  Camera,
  Sliders,
  Eye,
  History,
  Trash2,
  Wand2,
  Layers,
  BookOpen,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

async function fetchWithRetry(url, options, maxRetries = 3) {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        if (i === maxRetries - 1) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Server Error (${response.status})`);
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Request failed (${response.status})`);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function callGeminiText({ prompt, systemInstruction = "", imageBase64 = null, imageMime = "image/jpeg", responseSchema = null }) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const parts = [];
  if (prompt) parts.push({ text: prompt });
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: imageMime,
        data: imageBase64
      }
    });
  }

  const payload = {
    contents: [{ role: 'user', parts }]
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    };
  }

  const res = await fetchWithRetry(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return textResult;
}

async function callGeminiImage({ prompt, faceBase64, faceMime, clothingBase64, clothingMime, aspectRatio = "1:1" }) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

  const parts = [];
  
  let structuredPrompt = `High quality, ultra-photorealistic studio photography. ${prompt}`;
  
  if (faceBase64) {
    structuredPrompt += ` IMPORTANT: Use the face, features, skin tone, hair, and facial identity from the provided primary face image. Maintain 100% facial similarity.`;
  }
  if (clothingBase64) {
    structuredPrompt += ` IMPORTANT: Match the exact outfit, clothing style, pattern, fabric, and colors shown in the provided clothing reference image.`;
  }

  parts.push({ text: structuredPrompt });

  if (faceBase64) {
    parts.push({
      inlineData: {
        mimeType: faceMime || "image/jpeg",
        data: faceBase64
      }
    });
  }

  if (clothingBase64) {
    parts.push({
      inlineData: {
        mimeType: clothingMime || "image/jpeg",
        data: clothingBase64
      }
    });
  }

  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  };

  const res = await fetchWithRetry(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const candidatePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!candidatePart || !candidatePart.inlineData) {
    throw new Error("Model tidak mengembalikan gambar valid. Cobalah perjelas deskripsi atau unggah gambar dengan resolusi yang lebih baik.");
  }

  return `data:${candidatePart.inlineData.mimeType};base64,${candidatePart.inlineData.data}`;
}

const POSE_PRESETS = [
  { id: 'p1', category: 'Fashion Studio', title: 'Editorial Vogue Pose', prompt: 'Standing editorial fashion pose, hands in pocket, slightly tilted head, dramatic studio softbox rim light, minimalist grey backdrop, 85mm lens, sharp focus' },
  { id: 'p2', category: 'Fashion Studio', title: 'High Fashion Seated', prompt: 'Seated on a modern wooden stool, relaxed cross-legged posture, looking directly into camera with confident expression, studio key lighting, warm soft shadows' },
  { id: 'p3', category: 'Casual & Outdoor', title: 'Urban Walk Streetwear', prompt: 'Full body shot, walking naturally on a quiet minimalist city street, soft natural golden hour backlight, cinematic shallow depth of field, 35mm lens' },
  { id: 'p4', category: 'Casual & Outdoor', title: 'Cafe Window Portrait', prompt: 'Half body shot sitting by a glass window in a luxury modern coffee shop, natural morning daylight, soft reflection on glass, warm aesthetic tone' },
  { id: 'p5', category: 'Executive & Formal', title: 'Corporate Power Stance', prompt: 'Upper body portrait, arms crossed confidently, crisp studio lighting, subtle dark gradient background, professional business portrait finish' },
  { id: 'p6', category: 'Artistic & Cinematic', title: 'Cyberpunk Neon Studio', prompt: 'Cinematic portrait shot with vibrant cyan and magenta dual neon lighting, dramatic deep shadows, glossy reflections, futuristic atmospheric mood' }
];

export default function PoseFlowAI() {
  const [inputMode, setInputMode] = useState('upload');
  const [sourceImage, setSourceImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [manualSubject, setManualSubject] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [results, setResults] = useState([]);
  const [jiplakPrompt, setJiplakPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("distorted face, blurry, bad anatomy, extra limbs, low resolution, unnatural skin");
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [history, setHistory] = useState([]);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);
  const clothingInputRef = useRef(null);

  useEffect(() => {
    const handlePaste = (event) => {
      if (inputMode === 'manual') return;
      const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items;
      if (!items) return;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e) => {
            setSourceImage(e.target.result);
            setError(null);
            showToast("Foto berhasil ditempel dari Clipboard!");
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [inputMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran berkas terlalu besar. Gunakan gambar di bawah 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result);
        setError(null);
        showToast("Foto wajah model berhasil diunggah");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran pakaian terlalu besar (max 10MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setClothingImage(reader.result);
        setError(null);
        showToast("Referensi pakaian berhasil diunggah");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    showToast("Teks prompt berhasil disalin!");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Mengunduh hasil foto 4K...");
  };

  const enhancePromptWithAI = async () => {
    const basePrompt = customPrompt || jiplakPrompt;
    if (!basePrompt) {
      setError("Masukkan teks prompt dasar sebelum menggunakan optimasi AI.");
      return;
    }
    setIsEnhancing(true);
    setError(null);
    try {
      const systemInst = "You are a world-class professional commercial photographer and prompt engineer. Transform user descriptions into detailed, photorealistic photography prompts with explicit camera lens (e.g. 85mm f/1.4), studio lighting setup, rich textures, and atmosphere. Keep it under 60 words.";
      
      const optimized = await callGeminiText({
        prompt: `Enhance this photo prompt: "${basePrompt}"`,
        systemInstruction: systemInst
      });

      const cleaned = optimized.trim();
      if (inputMode === 'jiplak') {
        setJiplakPrompt(cleaned);
      } else {
        setCustomPrompt(cleaned);
      }
      showToast("Prompt berhasil dioptimalkan oleh Gemini AI!");
    } catch (err) {
      setError("Gagal mengoptimalkan prompt: " + err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const analyzeJiplakStyle = async () => {
    if (!sourceImage) {
      setError("Unggah foto referensi pose terlebih dahulu pada kotak utama.");
      return;
    }
    setIsGenerating(true);
    setGenerationStep("Mengekstrak pose, pencahayaan & komposisi latar dari foto...");
    setError(null);

    try {
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1] || "image/jpeg";
      
      const promptText = `Analyze ONLY the pose, body position, framing, camera angle, and background environment of this reference image. IGNORE the clothing and facial identity of the person.
      Create a detailed technical photography prompt describing ONLY the pose, camera distance, and background setting.
      Keep it direct, professional, and clear.`;

      const extractedPrompt = await callGeminiText({
        prompt: promptText,
        imageBase64: base64Data,
        imageMime: mimeType
      });

      setJiplakPrompt(extractedPrompt.trim() || "Medium shot portrait pose in a professional studio setting with soft key lighting.");
      showToast("Pose & Latar berhasil diekstrak!");
    } catch (err) {
      setError("Gagal menganalisis foto referensi: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const generatePoses = async () => {
    if (inputMode === 'upload' && !sourceImage) {
      setError("Mohon unggah foto wajah model terlebih dahulu.");
      return;
    }
    if (inputMode === 'manual' && !manualSubject) {
      setError("Mohon tuliskan deskripsi subjek terlebih dahulu.");
      return;
    }
    if (inputMode === 'jiplak' && !jiplakPrompt) {
      setError("Ekstrak pose atau isi prompt pose terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setError(null);
    setGenerationStep("Menyusun variasi instruksi pose...");

    try {
      let faceBase64 = sourceImage ? sourceImage.split(',')[1] : null;
      let faceMime = sourceImage ? sourceImage.split(';')[0].split(':')[1] : "image/jpeg";
      
      let clothingBase64 = clothingImage ? clothingImage.split(',')[1] : null;
      let clothingMime = clothingImage ? clothingImage.split(';')[0].split(':')[1] : "image/jpeg";

      const coreInstruction = inputMode === 'jiplak' ? jiplakPrompt : (customPrompt || manualSubject || "Professional studio photo");

      const schema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            prompt: { type: "STRING" }
          },
          propertyOrdering: ["title", "prompt"]
        }
      };

      const jsonPrompt = `Based on this core style description: "${coreInstruction}", create 2 photography pose variations.
      Variation 1: Classic primary pose framing.
      Variation 2: Alternative camera angle or subtle dynamic pose variation.
      Ensure descriptions emphasize sharp details, high quality lighting, and clean focus.`;

      let variations = [];
      try {
        const jsonText = await callGeminiText({
          prompt: jsonPrompt,
          responseSchema: schema
        });
        variations = JSON.parse(jsonText);
      } catch (e) {
        variations = [
          { title: "Variasi Studio Utama", prompt: `${coreInstruction}, professional portrait angle` },
          { title: "Variasi Sudut Alternatif", prompt: `${coreInstruction}, dynamic medium angle shot` }
        ];
      }

      if (!Array.isArray(variations) || variations.length === 0) {
        variations = [
          { title: "Variasi Pose 1", prompt: coreInstruction },
          { title: "Variasi Pose 2", prompt: `${coreInstruction}, slightly different camera perspective` }
        ];
      }

      const generatedResults = [];
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        setGenerationStep(`Merender Variasi ${i + 1} (${v.title}) via Gemini 3.1 Flash Image...`);

        const fullPrompt = `${v.prompt}. Avoid: ${negativePrompt}`;

        const imageUrl = await callGeminiImage({
          prompt: fullPrompt,
          faceBase64: faceBase64,
          faceMime: faceMime,
          clothingBase64: clothingBase64,
          clothingMime: clothingMime,
          aspectRatio: aspectRatio
        });

        const newResultItem = {
          id: Date.now() + i,
          url: imageUrl,
          title: v.title,
          prompt: fullPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        generatedResults.push(newResultItem);
        setResults([...generatedResults]);
      }

      setHistory(prev => [...generatedResults, ...prev].slice(0, 10));
      showToast("Berhasil merender variasi foto 4K!");

    } catch (err) {
      setError("Kesalahan Generasi AI: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white antialiased pb-12">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-indigo-400/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="mb-6 bg-muted/60 border border-border rounded-2xl p-4 sm:p-5 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mt-0.5">
              {inputMode === 'upload' && <Users className="w-5 h-5" />}
              {inputMode === 'jiplak' && <ScanSearch className="w-5 h-5" />}
              {inputMode === 'manual' && <Wand2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                {inputMode === 'upload' && 'Mode 100% Face & Outfit Lock Studio'}
                {inputMode === 'jiplak' && 'Mode Jiplak Pose & Komposisi Foto Referensi'}
                {inputMode === 'manual' && 'Mode Teks Konsep Studio Murni'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {inputMode === 'upload' && 'Unggah foto wajah utama dan referensi baju untuk mengunci identitas & busana dalam foto variasi baru.'}
                {inputMode === 'jiplak' && 'AI mengekstrak posisi tubuh & latar dari foto referensi. Wajah & Pakaian dapat diganti terpisah.'}
                {inputMode === 'manual' && 'Gunakan deskripsi teks mendalam untuk menghasilkan foto profesional tanpa foto wajah acuan.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border self-end sm:self-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Gemini 3.1 Flash Image Engine
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mode Switcher */}
        <div className="mb-6 flex bg-muted/80 p-1 rounded-xl border border-border shadow-inner w-fit">
          {[
            { id: 'upload', label: 'Upload Wajah', icon: Users },
            { id: 'jiplak', label: 'Jiplak Pose', icon: ScanSearch },
            { id: 'manual', label: 'Teks Studio', icon: Wand2 },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button 
                key={mode.id}
                onClick={() => { 
                  setInputMode(mode.id); 
                  setError(null); 
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  inputMode === mode.id 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Panel: Inputs & Controls */}
          <aside className="w-full lg:w-[420px] space-y-5 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xl space-y-5">
              
              {/* Primary Image Input */}
              {(inputMode === 'upload' || inputMode === 'jiplak') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      {inputMode === 'jiplak' ? 'Foto Referensi Pose & Latar' : 'Foto Wajah Model Utama (Face Lock)'}
                    </label>
                    {sourceImage && (
                      <button onClick={() => setSourceImage(null)} className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1">
                        <X className="w-3 h-3" /> Hapus
                      </button>
                    )}
                  </div>

                  <div 
                    onClick={() => !isGenerating && fileInputRef.current.click()}
                    className={`relative cursor-pointer transition-all rounded-xl border-2 border-dashed aspect-video flex flex-col items-center justify-center bg-background group overflow-hidden ${
                      sourceImage 
                        ? 'border-indigo-500/50' 
                        : 'border-border hover:border-border hover:bg-muted/50'
                    } ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {sourceImage ? (
                      <div className="relative w-full h-full p-2 flex items-center justify-center bg-background">
                        <img src={sourceImage} alt="Subject Source" className="max-h-full max-w-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="text-xs font-semibold text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">Ganti Foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">Klik untuk unggah atau tekan <span className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">Ctrl + V</span></p>
                        <p className="text-[10px] text-muted-foreground">Format PNG, JPG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
                </div>
              )}

              {/* Manual Text Subject Input */}
              {inputMode === 'manual' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Deskripsi Subjek Model
                  </label>
                  <textarea 
                    value={manualSubject} 
                    onChange={(e) => setManualSubject(e.target.value)} 
                    placeholder="Contoh: Model pria Indonesia usia 25 tahun, rambut hitam rapi, senyum tipis ramah, sorot mata tajam..." 
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground min-h-[90px] resize-none focus:outline-none focus:border-indigo-500/60 placeholder:text-muted-foreground" 
                  />
                </div>
              )}

              {/* Clothing Reference Input */}
              <div className="space-y-2 border-t border-border/80 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-violet-400" /> Referensi Pakaian (Exact Outfit Lock)
                  </label>
                  {clothingImage && (
                    <button onClick={() => setClothingImage(null)} className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1">
                      <X className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                {clothingImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-violet-500/40 bg-background p-1 group">
                    <img src={clothingImage} alt="Clothing Reference" className="w-full h-full object-contain rounded-lg" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow">OUTFIT LOCKED</div>
                  </div>
                ) : (
                  <div 
                    onClick={() => !isGenerating && clothingInputRef.current.click()} 
                    className="py-3 px-4 border border-dashed border-border hover:border-border rounded-xl flex items-center justify-between bg-background/40 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-muted rounded-lg text-muted-foreground group-hover:text-violet-400 transition-colors">
                        <Shirt className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Unggah foto baju / Jaket khusus</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">Opsional</span>
                  </div>
                )}
                <input type="file" ref={clothingInputRef} onChange={handleClothingUpload} className="hidden" accept="image/*" />
              </div>

              {/* Custom Prompt */}
              {inputMode !== 'jiplak' && (
                <div className="space-y-2 border-t border-border/80 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Konsep / Suasana Foto</label>
                    <button 
                      onClick={enhancePromptWithAI} 
                      disabled={isEnhancing || !customPrompt}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 disabled:opacity-40 transition-colors"
                    >
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Optimalkan AI Gemini
                    </button>
                  </div>
                  <textarea 
                    value={customPrompt} 
                    onChange={(e) => setCustomPrompt(e.target.value)} 
                    placeholder="Misal: Studio profesional lighting, gaya casual berdiri santai, latar belakang minimalis hangat..." 
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground min-h-[75px] resize-none focus:outline-none focus:border-indigo-500/60 placeholder:text-muted-foreground" 
                  />
                </div>
              )}

              {/* Aspect Ratio */}
              <div className="space-y-2.5 border-t border-border/80 pt-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-muted-foreground" /> Aspect Ratio Hasil Rendition
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '1:1', label: '1:1 Square' },
                    { id: '4:5', label: '4:5 Feed' },
                    { id: '9:16', label: '9:16 Story' },
                    { id: '16:9', label: '16:9 Cinema' },
                  ].map((r) => (
                    <button 
                      key={r.id} 
                      onClick={() => setAspectRatio(r.id)} 
                      className={`py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                        aspectRatio === r.id 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                          : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      {r.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-1.5 border-t border-border/80 pt-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Negative Prompt (Cegah Distorsi)</label>
                <input 
                  type="text" 
                  value={negativePrompt} 
                  onChange={(e) => setNegativePrompt(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[11px] text-muted-foreground focus:outline-none focus:border-border" 
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={inputMode === 'jiplak' ? analyzeJiplakStyle : generatePoses}
                disabled={isGenerating || (inputMode === 'upload' && !sourceImage) || (inputMode === 'manual' && !manualSubject)}
                className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 shadow-xl shadow-indigo-600/20 uppercase tracking-wider"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : inputMode === 'jiplak' ? <ScanSearch className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating 
                  ? (generationStep || 'Memproses...') 
                  : inputMode === 'jiplak' 
                    ? '1. EKSTRAK POSE DARI FOTO' 
                    : 'GENERATE FOTO 4K SUNGGUHAN'
                }
              </button>

            </div>

            {/* Presets Library */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> Katalogue Preset Pose Populer
                </h3>
                <span className="text-[10px] text-muted-foreground">{POSE_PRESETS.length} pilihan</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {POSE_PRESETS.map((preset) => (
                  <div 
                    key={preset.id}
                    onClick={() => {
                      if (inputMode === 'jiplak') {
                        setJiplakPrompt(preset.prompt);
                      } else {
                        setCustomPrompt(preset.prompt);
                      }
                      showToast(`Preset "${preset.title}" diterapkan`);
                    }}
                    className="p-2.5 bg-background/60 border border-border/80 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-foreground group-hover:text-indigo-300">{preset.title}</div>
                      <div className="text-[9px] text-muted-foreground">{preset.category}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

          </aside>

          {/* Right Panel: Working Space & Results */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Jiplak Pose Textbox Editor */}
            {inputMode === 'jiplak' && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ScanSearch className="w-4 h-4 text-indigo-400" />
                    Hasil Ekstraksi Pose & Latar
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={enhancePromptWithAI} 
                      disabled={!jiplakPrompt || isEnhancing} 
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40"
                    >
                      {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} 
                      Optimalkan AI
                    </button>
                    <button 
                      onClick={analyzeJiplakStyle} 
                      disabled={!sourceImage || isGenerating} 
                      className="text-xs font-bold text-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" /> Ekstrak Ulang
                    </button>
                  </div>
                </div>

                <textarea 
                  value={jiplakPrompt} 
                  onChange={(e) => setJiplakPrompt(e.target.value)} 
                  placeholder="Instruksi pose akan muncul di sini secara otomatis setelah mengekstrak foto referensi..." 
                  className="w-full bg-background border border-border rounded-xl p-4 text-xs text-foreground min-h-[120px] resize-none focus:outline-none focus:border-indigo-500/60 leading-relaxed font-mono" 
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button 
                    onClick={() => handleCopy(jiplakPrompt, 'jiplak-main')} 
                    disabled={!jiplakPrompt} 
                    className="flex-1 bg-muted border border-border h-11 rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-2 hover:bg-muted/80 transition-all disabled:opacity-40"
                  >
                    {copyStatus === 'jiplak-main' ? <span className="text-emerald-400 font-bold">Tersalin!</span> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    Salin Prompt Pose
                  </button>
                  <button 
                    onClick={generatePoses} 
                    disabled={!jiplakPrompt || isGenerating} 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg disabled:opacity-40"
                  >
                    <ImageIcon className="w-4 h-4" />
                    2. Render Foto 4K dengan Pose Ini
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" /> 
                <div>
                  <div className="font-bold mb-0.5">Terjadi Kesalahan</div>
                  {error}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isGenerating && (
              <div className="bg-card/90 border border-indigo-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl backdrop-blur-md">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{generationStep || "Gemini AI Sedang Merender Foto..."}</div>
                  <p className="text-xs text-muted-foreground mt-1">Mengaplikasikan 100% Face Similarity & Precision Outfit Matching</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Hasil Generasi Variasi Foto 4K
                  </h3>
                  <span className="text-xs text-muted-foreground">{results.length} Foto Dihasilkan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {results.map((res, idx) => (
                      <motion.div 
                        key={res.id} 
                        layout 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="group bg-card border border-border rounded-2xl overflow-hidden shadow-2xl hover:border-border transition-all duration-300 flex flex-col"
                      >
                        <div className={`relative ${getAspectRatioClass()} bg-background flex items-center justify-center overflow-hidden`}>
                          <img src={res.url} alt={res.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 p-4">
                            <button 
                              onClick={() => setPreviewModalImage(res.url)}
                              className="bg-muted/90 text-foreground p-2.5 rounded-xl hover:bg-muted transition-colors border border-border shadow-xl"
                              title="Perbesar Gambar"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => downloadImage(res.url, `poseflow-4k-${idx + 1}.png`)} 
                              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-xl"
                            >
                              <Download className="w-4 h-4" /> Unduh Foto 4K
                            </button>
                          </div>

                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-border">
                              Variasi {idx + 1}
                            </span>
                            {clothingImage && (
                              <span className="bg-emerald-500/90 text-white px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                                Outfit Lock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-card border-t border-border space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-xs font-bold text-foreground">{res.title}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono">{res.timestamp}</span>
                            </div>
                            <div className="bg-background p-2.5 rounded-xl border border-border/80">
                              <p className="text-[11px] text-muted-foreground italic line-clamp-2">"{res.prompt}"</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button 
                              onClick={() => handleCopy(res.prompt, res.id)} 
                              className="text-[11px] text-muted-foreground hover:text-indigo-400 font-medium flex items-center gap-1 transition-colors"
                            >
                              {copyStatus === res.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copyStatus === res.id ? "Disalin" : "Salin Prompt Rendition"}
                            </button>
                            <button 
                              onClick={() => downloadImage(res.url, `poseflow-4k-${idx + 1}.png`)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> Simpan
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* History Gallery */}
            {history.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xl space-y-4 border-t-2 border-t-indigo-500/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-muted-foreground" />
                    Riwayat Sesi Generasi Terakhir
                  </h3>
                  <button onClick={() => setHistory([])} className="text-[10px] text-muted-foreground hover:text-rose-400 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Bersihkan Riwayat
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {history.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setPreviewModalImage(item.url)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-background cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <img src={item.url} alt="History item" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Lightbox Image Modal */}
      <AnimatePresence>
        {previewModalImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalImage(null)}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <div className="relative max-w-4xl max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setPreviewModalImage(null)}
                className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground p-2 rounded-full bg-muted/80"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={previewModalImage} alt="Fullscreen preview" className="max-w-full max-h-[80vh] rounded-2xl border border-border shadow-2xl object-contain" />
              <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => downloadImage(previewModalImage, 'poseflow-full-4k.png')}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-xl"
                >
                  <Download className="w-4 h-4" /> Unduh Resolusi Penuh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
