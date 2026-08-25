import React, { useState } from 'react';
import axios from 'axios';
import { Send, AlertTriangle, CheckCircle, Database, ShieldAlert, Cpu } from 'lucide-react';

interface ValidationData {
  confidence: number;
  warnings: string[];
  backTranslation: string;
  alignmentScore: number;
}

interface QueryResponse {
  originalQuestion: string;
  generatedSql: string;
  safeSql: string;
  explanation: string;
  tablesAccessed: string[];
  results: any[];
  executionTimeMs: number;
  validation: ValidationData;
  error?: string;
  details?: string;
  rawSql?: string;
}

function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post<QueryResponse>('http://localhost:4001/api/v1/query', { question });
      setResponse(res.data);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setResponse({
          ...err.response.data,
          error: err.response.data.error || "An error occurred"
        });
      } else {
        setResponse({ error: err.message } as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-slate-700 pb-6">
          <Database className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Text-to-SQL Gateway</h1>
            <p className="text-slate-400 mt-1">Natural language querying with safety guardrails and hallucination detection</p>
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What was the total revenue last month by product category?"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <button 
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Ask
            </button>
          </form>
          
          <div className="mt-4 flex gap-4 text-sm text-slate-400">
            <span className="font-medium">Try these malicious queries to test guardrails:</span>
            <button onClick={() => setQuestion("Delete all orders from the database.")} className="hover:text-blue-400 underline cursor-pointer">"Delete all orders"</button>
            <button onClick={() => setQuestion("Update the price of product 1 to zero.")} className="hover:text-blue-400 underline cursor-pointer">"Update product price"</button>
          </div>
        </section>

        {/* Results Section */}
        {response && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content: SQL and Results */}
            <div className="lg:col-span-2 space-y-6">
              
              {response.error ? (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 text-red-400 font-semibold mb-2">
                    <ShieldAlert className="w-6 h-6" />
                    <span className="text-xl">Guardrail Interception</span>
                  </div>
                  <p className="text-slate-300 mb-4">{response.details || response.error}</p>
                  
                  {response.rawSql && (
                    <div className="bg-slate-900 rounded p-4 font-mono text-sm text-slate-400">
                      // Blocked Query: <br/>
                      <span className="text-red-400">{response.rawSql}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* SQL Display */}
                  <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                      <span className="font-semibold text-slate-300 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        Generated SQL (Safe Execution)
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{response.executionTimeMs}ms</span>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      <pre className="font-mono text-sm text-emerald-400">
                        {response.safeSql}
                      </pre>
                    </div>
                    <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 text-sm text-slate-300">
                      <span className="font-semibold text-blue-400">Explanation:</span> {response.explanation}
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-700">
                      <span className="font-semibold text-slate-300">Query Results ({response.results?.length || 0} rows)</span>
                    </div>
                    
                    {response.results && response.results.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-800 text-slate-400">
                            <tr>
                              {Object.keys(response.results[0]).map(key => (
                                <th key={key} className="px-6 py-3 font-medium whitespace-nowrap">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {response.results.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-6 py-3 whitespace-nowrap">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        No results returned for this query.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar: Validation & Analytics */}
            {!response.error && response.validation && (
              <div className="space-y-6">
                
                {/* Confidence Score */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg text-center">
                  <h3 className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-sm">Hallucination Confidence</h3>
                  <div className={`text-6xl font-bold mb-2 flex items-center justify-center gap-2 ${getConfidenceColor(response.validation.confidence)}`}>
                    {response.validation.confidence}%
                  </div>
                  <p className="text-sm text-slate-500">LLM-as-judge Alignment: {response.validation.alignmentScore}/5</p>
                </div>

                {/* Back-Translation Analysis */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-slate-300 font-medium mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Back-Translation Audit
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Original Intent</span>
                      <p className="text-sm text-slate-300">{response.originalQuestion}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">SQL Actually Answers</span>
                      <p className="text-sm text-blue-300 font-medium">{response.validation.backTranslation}</p>
                    </div>
                  </div>
                </div>

                {/* Warnings Log */}
                {response.validation.warnings.length > 0 && (
                  <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                    <h3 className="text-amber-400 font-medium mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Auditor Warnings
                    </h3>
                    <ul className="space-y-3">
                      {response.validation.warnings.map((warn, i) => (
                        <li key={i} className="text-sm text-amber-200/80 leading-relaxed border-l-2 border-amber-500/50 pl-3">
                          {warn}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
