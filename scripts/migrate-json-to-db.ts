#!/usr/bin/env node

/**
 * Script de migration des données JSON vers MySQL avec Prisma
 * Usage: npx ts-node scripts/migrate-json-to-db.ts
 *
 * Ce script:
 * 1. Lit le fichier data/market.json
 * 2. Migre les users, books, transactions, etc. vers MySQL
 * 3. Crée les relations correctes
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

interface JSONUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  blocked?: boolean;
  cart?: string[];
}

interface JSONBook {
  id: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  coverImage: string;
  stock?: number;
  category?: string;
  status?: string;
  eBook?: boolean;
  source?: string;
}

interface JSONTransaction {
  id: string;
  orderId: string;
  userId: string;
  bookIds: string[];
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  paydunyaInvoiceToken?: string;
  paydunyaResponseCode?: string;
}

async function migrateData() {
  try {
    console.log('🚀 Démarrage de la migration JSON → MySQL...\n');

    const dataPath = path.join(process.cwd(), 'data', 'market.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Map UUID -> ID pour les relations
    const userMap: { [key: string]: number } = {};
    const bookMap: { [key: string]: number } = {};

    // ===========================
    // 1. MIGRER LES USERS
    // ===========================
    console.log('📝 Migration des utilisateurs...');
    const users = data.users || [];

    for (const user of users) {
      try {
        const createdUser = await prisma.user.create({
          data: {
            name: user.name || 'Unknown',
            email: user.email || `user${Math.random()}@example.com`,
            password: user.passwordHash || '',
            role: user.role || 'client',
            blocked: user.blocked ?? false,
          },
        });
        userMap[user.id] = createdUser.id;
        console.log(`  ✅ ${user.email} → ID ${createdUser.id}`);
      } catch (err: any) {
        if (err.code === 'P2002') {
          console.log(`  ⚠️  ${user.email} existe déjà (skipped)`);
          // Récupérer l'ID existant
          const existing = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existing) userMap[user.id] = existing.id;
        } else {
          console.error(`  ❌ Erreur: ${err.message}`);
        }
      }
    }

    // ===========================
    // 2. MIGRER LES BOOKS
    // ===========================
    console.log('\n📚 Migration des livres...');
    const books = data.books || [];

    for (const book of books) {
      try {
        const createdBook = await prisma.book.create({
          data: {
            uuid: book.id,
            title: book.title || 'Untitled',
            author: book.author || 'Unknown',
            description: book.description || '',
            price: book.price || 0,
            coverImage: book.coverImage || '',
            stock: book.stock || 0,
            category: book.category || '',
            status: book.status || 'available',
            eBook: book.eBook ?? true,
            source: book.source || 'admin',
          },
        });
        bookMap[book.id] = createdBook.id;
        console.log(`  ✅ "${book.title}" → ID ${createdBook.id}`);
      } catch (err: any) {
        console.error(`  ❌ Erreur pour "${book.title}": ${err.message}`);
      }
    }

    // ===========================
    // 3. MIGRER LES TRANSACTIONS
    // ===========================
    console.log('\n💳 Migration des transactions...');
    const transactions = data.transactions || [];

    for (const tx of transactions) {
      try {
        const userId = tx.userId ? userMap[tx.userId] : null;

        const createdTx = await prisma.transaction.create({
          data: {
            uuid: tx.id,
            orderId: tx.orderId || tx.id,
            userId,
            amount: tx.amount || 0,
            paymentMethod: tx.paymentMethod || 'unknown',
            status: tx.status || 'pending',
            bookIds: Array.isArray(tx.bookIds)
              ? JSON.stringify(tx.bookIds)
              : '[]',
            paydunyaInvoiceToken: tx.paydunyaInvoiceToken || '',
            paydunyaResponseCode: tx.paydunyaResponseCode || '',
            createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          },
        });
        console.log(`  ✅ Transaction ${tx.orderId} → ID ${createdTx.id}`);
      } catch (err: any) {
        console.error(`  ❌ Erreur pour ${tx.orderId}: ${err.message}`);
      }
    }

    // ===========================
    // 4. MIGRER LES PURCHASES
    // ===========================
    console.log('\n🛒 Migration des achats...');
    const purchases = data.purchases || [];

    for (const purchase of purchases) {
      try {
        const userId = purchase.userId ? userMap[purchase.userId] : null;
        const bookId = purchase.bookId ? bookMap[purchase.bookId] : null;

        if (!userId || !bookId) {
          console.log(
            `  ⚠️  Purchase skipped: user ou book non trouvé`
          );
          continue;
        }

        const createdPurchase = await prisma.purchase.create({
          data: {
            uuid: purchase.id,
            userId,
            bookId,
            amount: purchase.amount || 0,
            downloadCount: purchase.downloadCount || 0,
            createdAt: purchase.createdAt
              ? new Date(purchase.createdAt)
              : new Date(),
          },
        });
        console.log(
          `  ✅ Purchase ${purchase.id} → ID ${createdPurchase.id}`
        );
      } catch (err: any) {
        console.error(`  ❌ Erreur: ${err.message}`);
      }
    }

    // ===========================
    // 5. MIGRER LES SUBMISSIONS
    // ===========================
    console.log('\n📬 Migration des soumissions...');
    const submissions = data.submissions || [];

    for (const submission of submissions) {
      try {
        const userId = submission.userId
          ? userMap[submission.userId]
          : null;

        if (!userId) {
          console.log(
            `  ⚠️  Submission skipped: user non trouvé`
          );
          continue;
        }

        const createdSubmission = await prisma.submission.create({
          data: {
            uuid: submission.id,
            userId,
            title: submission.title || 'Untitled',
            author: submission.author || 'Unknown',
            description: submission.description || '',
            category: submission.category || '',
            status: submission.status || 'pending',
            createdAt: submission.createdAt
              ? new Date(submission.createdAt)
              : new Date(),
          },
        });
        console.log(
          `  ✅ Submission "${submission.title}" → ID ${createdSubmission.id}`
        );
      } catch (err: any) {
        console.error(`  ❌ Erreur: ${err.message}`);
      }
    }

    console.log('\n✨ Migration terminée avec succès!\n');

    // Afficher les statistiques
    const userCount = await prisma.user.count();
    const bookCount = await prisma.book.count();
    const txCount = await prisma.transaction.count();
    const purchaseCount = await prisma.purchase.count();
    const submissionCount = await prisma.submission.count();

    console.log('📊 Statistiques:');
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  📚 Books: ${bookCount}`);
    console.log(`  💳 Transactions: ${txCount}`);
    console.log(`  🛒 Purchases: ${purchaseCount}`);
    console.log(`  📬 Submissions: ${submissionCount}`);
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
