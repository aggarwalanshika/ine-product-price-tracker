import React from 'react';
import { X, Video, Play, CheckCircle, AlertTriangle, Loader2, Download, Sparkles, Terminal } from 'lucide-react';

export default function HeadedRunModal({ isOpen, onClose, isRunning, runData, product }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-card rounded-2xl border border-gold-500/40 overflow-hidden flex flex-col shadow-2xl animate-slide-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gold-500/20 flex items-center justify-between bg-burgundy-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-purple-200">Observable Headed Scraper Run</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full">
                  Playwright Headed Mode
                </span>
              </div>
              <p className="text-xs text-amber-200/60">
                Live headed run demonstration for <strong className="text-gold-300 font-normal">{product.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-amber-200/60 hover:text-gold-300 hover:bg-burgundy-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {isRunning ? (
            <div className="py-16 text-center space-y-4 bg-burgundy-900/40 rounded-2xl border border-purple-500/30">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-100">Executing Headed Chromium Browser...</h3>
                <p className="text-xs text-amber-200/60 max-w-md mx-auto mt-1">
                  Playwright is launching a headed window, hovering over the price block to meet dwell requirements, clicking 'Reveal price', and recording video.
                </p>
              </div>
            </div>
          ) : runData ? (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${runData.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {runData.success ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
                  <div>
                    <h4 className="font-serif font-bold text-sm">
                      {runData.success ? 'Headed Run Completed Successfully' : 'Headed Run Finished with Errors'}
                    </h4>
                    <p className="text-xs opacity-80">
                      Duration: <strong>{runData.result?.durationMs || 0} ms</strong> | Extracted Price:{' '}
                      <strong>₹{runData.result?.price?.toLocaleString() || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                {runData.result?.videoUrl && (
                  <a
                    href={runData.result.videoUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow"
                  >
                    <Download className="w-3.5 h-3.5 text-burgundy-950" />
                    <span>Download Recording (.webm)</span>
                  </a>
                )}
              </div>

              {/* Video Player Preview if available */}
              {runData.result?.videoUrl && (
                <div className="p-4 rounded-2xl bg-burgundy-900/60 border border-gold-500/20 space-y-3">
                  <h4 className="text-xs font-serif font-semibold text-amber-200 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-gold-400" />
                    <span>Screen Recording Preview (Observable Headed Run)</span>
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-black border border-gold-500/30 aspect-video max-h-96 mx-auto flex items-center justify-center">
                    <video
                      src={runData.result.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Live Step Logs Console */}
              <div className="p-4 rounded-2xl bg-burgundy-950/90 border border-gold-500/20 font-mono text-xs text-amber-100/90 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-gold-500/20 text-gold-300 text-[11px] font-semibold">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    Execution Progress Log
                  </span>
                  <span>{runData.result?.stepLogs?.length || 0} events</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1">
                  {(runData.result?.stepLogs || []).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-200/40 text-[10px]">
                        [{new Date(step.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className={step.level === 'error' ? 'text-rose-400' : step.level === 'warn' ? 'text-amber-300' : 'text-amber-100'}>
                        {step.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
}
