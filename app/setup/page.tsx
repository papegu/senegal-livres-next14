'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Bienvenue au Dashboard Admin
          </h1>
          <p className="text-xl text-gray-600">
            Configuration de votre administrateur MySQL
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`rounded-lg p-6 text-white font-semibold text-center transition ${
            completed.step1 ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <div className="text-3xl mb-2">{completed.step1 ? '✓' : '1'}</div>
            <div>Créer Utilisateur MySQL</div>
          </div>
          
          <div className={`rounded-lg p-6 text-white font-semibold text-center transition ${
            completed.step2 ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <div className="text-3xl mb-2">{completed.step2 ? '✓' : '2'}</div>
            <div>Lancer Migrations</div>
          </div>
          
          <div className={`rounded-lg p-6 text-white font-semibold text-center transition ${
            completed.step3 ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <div className="text-3xl mb-2">{completed.step3 ? '✓' : '3'}</div>
            <div>Accéder Dashboard</div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h2 className="text-2xl font-bold">Instructions de Configuration</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Étape 1: Créer l'Utilisateur MySQL
              </h3>
              <p className="text-gray-600 mb-4">
                Ouvrez PowerShell dans le répertoire du projet et exécutez:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code>.\scripts\create-mysql-admin.ps1</code>
              </div>
              <p className="text-gray-600 text-sm">
                Cela créera l'utilisateur <code className="bg-gray-100 px-2 py-1 rounded">papeabdoulaye</code> avec le mot de passe <code className="bg-gray-100 px-2 py-1 rounded">pape1982</code>
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Étape 2: Lancer les Migrations Prisma
              </h3>
              <p className="text-gray-600 mb-4">
                Une fois l'utilisateur créé, exécutez:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code>npx prisma migrate dev --name init</code>
              </div>
              <p className="text-gray-600 text-sm">
                Cela créera toutes les tables MySQL nécessaires (User, Book, Transaction, etc.)
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Étape 3: Rafraîchir la Page
              </h3>
              <p className="text-gray-600 mb-4">
                Une fois les migrations terminées, rafraîchissez cette page:
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                🔄 Rafraîchir
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Documentation</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  SETUP_INSTRUCTIONS.md - Guide complet
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  MYSQL_ADMIN_README.md - Résumé rapide
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  ADMIN_MYSQL_SETUP.md - Documentation détaillée
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔧 Commandes Utiles</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
                <span> - Lancer le serveur</span>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded">npx prisma studio</code>
                <span> - Voir les données</span>
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded">npx prisma migrate reset</code>
                <span> - Réinitialiser la base</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">📋 Informations d'Accès MySQL</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Utilisateur</p>
              <p className="font-mono text-gray-900">papeabdoulaye</p>
            </div>
            <div>
              <p className="text-gray-600">Mot de passe</p>
              <p className="font-mono text-gray-900">pape1982</p>
            </div>
            <div>
              <p className="text-gray-600">Host</p>
              <p className="font-mono text-gray-900">localhost:3306</p>
            </div>
            <div>
              <p className="text-gray-600">Base de données</p>
              <p className="font-mono text-gray-900">senegal_livres</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Une fois configuré, accédez à votre dashboard admin complet</p>
          <p className="text-sm mt-2">papeabdoulaye.gueye@uadb.edu.sn</p>
        </div>
      </div>
    </div>
  );
}
