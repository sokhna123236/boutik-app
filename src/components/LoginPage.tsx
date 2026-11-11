'use client';

import React, { useState } from 'react';
import { Store, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

type Mode = 'login' | 'register';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomBoutique, setNomBoutique] = useState('');
  const [telephone, setTelephone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Si Supabase n'est pas configuré, connexion directe en mode démo
  const handleDemoLogin = () => {
    onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Mode démo sans Supabase
      onLoginSuccess();
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          onLoginSuccess();
        }
      } else {
        // Inscription
        if (!nomBoutique.trim()) {
          throw new Error('Le nom de la boutique est obligatoire.');
        }
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nom_boutique: nomBoutique,
              telephone: telephone,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Créer le profil boutique
          await supabase.from('boutiques').insert({
            id: data.user.id,
            nom_boutique: nomBoutique,
            telephone: telephone,
          });

          setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
          setMode('login');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Une erreur est survenue.';
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('User already registered')) {
        setError('Un compte existe déjà avec cet email. Connectez-vous.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirmez votre email avant de vous connecter.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center p-4">
      {/* Logo & Titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">BoutikApp</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez votre boutique, vos dettes & vos rappels WhatsApp
        </p>
      </div>

      {/* Carte de connexion */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        {/* Onglets Login / Inscription */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Alertes */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nom de la boutique (inscription seulement) */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom de votre boutique *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Boutique Chez Diallo"
                    value={nomBoutique}
                    onChange={e => setNomBoutique(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Numéro Wave / Orange Money
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 77 123 45 67"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Adresse email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'register' ? 'Minimum 6 caractères' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'login' ? 'Connexion...' : 'Création...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Bouton démo */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>🛒</span>
          <span>Essayer sans compte (Mode démo)</span>
        </button>

        {/* Note de sécurité */}
        <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
          Vos données sont sécurisées et isolées. Chaque boutique ne voit que ses propres informations.
        </p>
      </div>

      {/* Tarif rappel */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          14 jours d'essai gratuit • Ensuite <strong className="text-emerald-700">3 000 FCFA/mois</strong>
        </p>
        <p className="text-[11px] text-gray-400 mt-1">Paiement Wave : 77 713 21 44</p>
      </div>
    </div>
  );
}
