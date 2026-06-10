"use client";
import React, { useState, useRef } from "react";
import { BookOpen, Sparkles, Play, Pause, Search, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function App() {
  const [level, setLevel] = useState("A2");
  const [theme, setTheme] = useState("Mystery");
  const [artStyle, setArtStyle] = useState("3D Pixar");
  const [characterName, setCharacterName] = useState("");
  const [customDetail, setCustomDetail] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [dictLoading, setDictLoading] = useState(false);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleGenerate = async () => {
    // 1. Önceki ses çalıyorsa durdur ve temizle (Üst üste binme hatası çözümü)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);

    setLoading(true);
    setResult(null);
    setShowQuizResults(false);
    setAnswers({}); 
    try {
      const res = await fetch("http://127.0.0.1:8000/api/uret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seviye: level,
          tema: theme,
          sanat_tarzi: artStyle,
          ana_karakter: characterName,
          ozel_detay: customDetail
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert("Hata! Python sunucusunun çalıştığından emin ol.");
    }
    setLoading(false);
  };

  const handleDictionarySearch = async () => {
    if (!word) return;
    setDictLoading(true);
    setMeaning("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sozluk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelime: word })
      });
      const data = await res.json();
      setMeaning(data.anlam);
    } catch (error) {
      setMeaning("Çeviri yapılamadı, bağlantıyı kontrol et.");
    }
    setDictLoading(false);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerSelect = (qIndex: number, option: string) => {
    if (showQuizResults) return; 
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            AI Story Weaver <Sparkles className="text-amber-400 w-6 h-6" />
          </h1>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Seviye</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-emerald-400">
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tema</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-emerald-400">
                <option value="Sci-Fi">🚀 Bilim Kurgu</option>
                <option value="Mystery">🔍 Gizem</option>
                <option value="Daily Life">☕ Günlük Hayat</option>
                <option value="History">🏛️ Tarih</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sanat Tarzı</label>
              <select value={artStyle} onChange={e => setArtStyle(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-emerald-400">
                <option value="Comic">💥 Çizgi Roman</option>
                <option value="3D Pixar">🎬 3D Pixar</option>
                <option value="Cinematic">🎥 Sinematik</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Baş Karakter Adı</label>
              <input type="text" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Örn: Luna" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Özel Detay / Konsept</label>
              <input type="text" value={customDetail} onChange={(e) => setCustomDetail(e.target.value)} placeholder="Örn: Ejderhalar" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-emerald-200 transform transition disabled:opacity-50">
            {loading ? "Yapay Zeka Hikayeyi Örüyor..." : "Maceramı Oluştur!"}
          </button>
        </div>

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            
            <div className="w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-200 min-h-[400px]">
              <img src={result.gorsel_url} alt="AI Generated Scene" className="w-full h-[400px] object-cover" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-amber-50 p-8 rounded-3xl border border-amber-100 relative shadow-sm">
                <button onClick={toggleAudio} className="absolute top-6 right-6 bg-white p-3 rounded-full shadow-sm text-emerald-500 hover:scale-110 transition">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" /> Hikayen
                </h2>
                <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {result.hikaye}
                </p>
                {result.ses_base64 && (
                  <audio ref={audioRef} src={`data:audio/mp3;base64,${result.ses_base64}`} onEnded={() => setIsPlaying(false)} className="hidden" />
                )}
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" /> Akıllı Sözlük
                </h2>
                <p className="text-sm text-indigo-700 mb-4">Hikayede bilmediğin bir kelime mi var? Buraya yaz:</p>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={word} onChange={e => setWord(e.target.value)} placeholder="Kelime..." className="flex-1 p-3 rounded-xl border border-indigo-200 text-slate-800 focus:ring-2 focus:ring-indigo-400" />
                  <button onClick={handleDictionarySearch} disabled={dictLoading} className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-xl transition">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                {dictLoading && <p className="text-sm text-indigo-500 animate-pulse">Çevriliyor...</p>}
                {meaning && <div className="bg-white p-4 rounded-xl border border-indigo-100 text-slate-700 text-sm whitespace-pre-wrap">{meaning}</div>}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
               <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" /> Okuduğunu Anlama Testi
               </h2>
               <div className="space-y-6">
                 {result.quiz && result.quiz.map((q: any, idx: number) => {
                   return (
                     <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="font-bold text-lg text-slate-800 mb-4">{idx + 1}. {q.soru}</p>
                       <div className="space-y-3">
                         {q.secenekler.map((secenek: string, sIdx: number) => {
                           const isSelected = answers[idx] === secenek;
                           // 2. Quiz Mantığı Hatası Çözümü (Birebir eşleşme şart)
                           const isCorrectAnswer = q.cevap === secenek; 
                           
                           let styleClass = "bg-white border-slate-300 hover:bg-slate-100";
                           let icon = null;

                           if (showQuizResults) {
                             if (isCorrectAnswer) {
                               styleClass = "bg-emerald-100 border-emerald-500 font-bold";
                               icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
                             } else if (isSelected && !isCorrectAnswer) {
                               styleClass = "bg-red-100 border-red-500";
                               icon = <XCircle className="w-5 h-5 text-red-600" />;
                             } else {
                               styleClass = "bg-slate-50 border-slate-200 opacity-50";
                             }
                           } else if (isSelected) {
                             styleClass = "bg-indigo-50 border-indigo-400";
                           }

                           return (
                             <div key={sIdx} onClick={() => handleAnswerSelect(idx, secenek)} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${styleClass}`}>
                               <div className="flex items-center gap-3">
                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                                   {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                 </div>
                                 <label className="text-slate-800 cursor-pointer">{secenek}</label>
                               </div>
                               {icon && <div>{icon}</div>}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   );
                 })}
               </div>
               
               {!showQuizResults && Object.keys(answers).length === (result.quiz?.length || 0) && (
                 <button onClick={() => setShowQuizResults(true)} className="mt-8 w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-md transition transform hover:-translate-y-1">
                   Cevaplarımı Kontrol Et
                 </button>
               )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}