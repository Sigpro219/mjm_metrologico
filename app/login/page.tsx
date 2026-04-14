'use client';

import Image from 'next/image';
import { ArrowLeft, Lock, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020406] font-display">
            
            {/* Background */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <Image 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" 
                    alt="Background" 
                    fill
                    className="object-cover opacity-20 blur-[2px] grayscale"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1a2b28] via-transparent to-black opacity-90"></div>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            {/* Back Link */}
            <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-slate-500 hover:text-white transition-all z-20 group">
                <ArrowLeft size={16} />
                <span className="text-[10px] font-black tracking-widest uppercase">MJM</span>
            </Link>

            {/* Login Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[600px] px-6 z-10"
            >
                <div className="bg-slate-900 border border-white/5 rounded-[48px] shadow-2xl overflow-hidden py-16 px-12 md:py-24 md:px-24">
                    <div className="flex flex-col items-center">
                        
                        <div className="mb-14 flex flex-col items-center text-center">
                            <Logo height={44} showName={false} className="mb-8" />
                            <h1 className="text-2xl font-light tracking-[0.3em] text-white">
                                PORTAL <span className="font-bold text-orange-500 uppercase">OPERATIVO</span>
                            </h1>
                            <p className="text-[9px] uppercase tracking-[0.5em] text-slate-600 mt-4 font-black uppercase">Metrologia Inteligente</p>
                        </div>

                        <form className="w-full flex flex-col gap-10" onSubmit={e => e.preventDefault()}>
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Email Corporativo</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="usuario@compañia.com"
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-8 text-sm text-white placeholder:text-slate-800 outline-none focus:border-orange-500 transition-all shadow-inner"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Password</label>
                                    <span className="text-[9px] font-bold text-slate-700 hover:text-orange-500 uppercase cursor-pointer">Olvide mi clave</span>
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 px-8 text-sm text-white placeholder:text-slate-800 outline-none focus:border-orange-500 transition-all shadow-inner"
                                />
                            </div>

                            <div className="pt-10 flex flex-col gap-12 items-center">
                                <button className="w-full bg-white text-slate-950 hover:bg-orange-500 hover:text-white py-5 rounded-2xl font-black text-[11px] tracking-[0.5em] uppercase transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3">
                                    ACCEDER AL PORTAL <ChevronRight size={14} strokeWidth={3} />
                                </button>
                                
                                <div className="flex flex-col items-center gap-6">
                                    <div className="h-px w-12 bg-white/10"></div>
                                    <p className="text-[9px] text-slate-700 uppercase tracking-[0.3em] font-black">
                                        Industrial Technology MJM
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Credit */}
            <div className="absolute bottom-12 w-full text-center">
                <p className="text-[9px] uppercase tracking-[0.7em] font-black text-slate-800/40">
                    MJM S.A.S 2026
                </p>
            </div>

        </div>
    );
}
