/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Dress, Client, Booking, Jewelry, Expense, CashWithdrawal } from './types';
import { INITIAL_DRESSES, INITIAL_CLIENTS, INITIAL_BOOKINGS, INITIAL_JEWELRY, INITIAL_EXPENSES, INITIAL_WITHDRAWALS } from './initialData';
import { db, saveDocument, deleteDocument, seedDatabaseIfEmpty, handleFirestoreError, OperationType } from './lib/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
const logoZeyna = '/src/logo_zeyna.jpg';

// Component Imports
import DashboardStats from './components/DashboardStats';
import CalendarView from './components/CalendarView';
import DressCatalog from './components/DressCatalog';
import JewelryCatalog from './components/JewelryCatalog';
import FinanceManager from './components/FinanceManager';
import BookingList from './components/BookingList';
import ClientList from './components/ClientList';
import BookingForm from './components/BookingForm';
import DailyEvents from './components/DailyEvents';

// Icons
import { 
  Sparkles, 
  Calendar, 
  Layers, 
  Users, 
  BookOpen, 
  Plus, 
  Download, 
  Upload, 
  Heart, 
  Clock,
  Info,
  X,
  Gem,
  Coins,
  CloudLightning
} from 'lucide-react';

const getTodayDateString = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const localDate = `${yyyy}-${mm}-${dd}`;
  if (yyyy === 2026) {
    return localDate;
  }
  return '2026-07-03';
};

export default function App() {
  // State initialization (subscribed to Firestore in real-time)
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [jewelry, setJewelry] = useState<Jewelry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'out' | 'in'; timestamp: string }[]>([]);
  
  // Real-time Checklists & Signatures state
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [signatures, setSignatures] = useState<Record<string, { signed: boolean; date: string; name: string }>>({});

  const [dbLoading, setDbLoading] = useState(true);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'out' | 'in' } | null>(null);

  // Navigation Tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'calendar' | 'bookings' | 'catalog' | 'jewelry' | 'finance' | 'clients'>('dashboard');

  // Booking Form Control
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Set up Firebase Firestore listeners and seed empty database on mount
  useEffect(() => {
    let active = true;

    const setupListeners = async () => {
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error("Firestore seeding failed:", err);
      }

      if (!active) return;

      const unsubDresses = onSnapshot(collection(db, 'dresses'), (snapshot) => {
        const list: Dress[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Dress);
        });
        if (active) setDresses(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'dresses');
      });

      const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
        const list: Client[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Client);
        });
        if (active) setClients(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clients');
      });

      const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        const list: Booking[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Booking);
        });
        if (active) setBookings(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      });

      const unsubJewelry = onSnapshot(collection(db, 'jewelry'), (snapshot) => {
        const list: Jewelry[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Jewelry);
        });
        if (active) setJewelry(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'jewelry');
      });

      const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Expense);
        });
        if (active) setExpenses(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'expenses');
      });

      const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
        const list: CashWithdrawal[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as CashWithdrawal);
        });
        if (active) setWithdrawals(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'withdrawals');
      });

      const unsubChecklists = onSnapshot(collection(db, 'checklists'), (snapshot) => {
        const dict: Record<string, Record<string, boolean>> = {};
        snapshot.forEach((doc) => {
          dict[doc.id] = doc.data().items || {};
        });
        if (active) setChecklists(dict);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'checklists');
      });

      const unsubSignatures = onSnapshot(collection(db, 'signatures'), (snapshot) => {
        const dict: Record<string, { signed: boolean; date: string; name: string }> = {};
        snapshot.forEach((doc) => {
          dict[doc.id] = doc.data() as { signed: boolean; date: string; name: string };
        });
        if (active) setSignatures(dict);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'signatures');
      });

      const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        if (active) {
          setNotifications(list);
          setDbLoading(false);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      });

      return () => {
        unsubDresses();
        unsubClients();
        unsubBookings();
        unsubJewelry();
        unsubExpenses();
        unsubWithdrawals();
        unsubChecklists();
        unsubSignatures();
        unsubNotifications();
      };
    };

    let cleanupFn: (() => void) | undefined;
    setupListeners().then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      active = false;
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const addNotification = async (message: string, type: 'out' | 'in') => {
    const id = `n-${Date.now()}`;
    const newNotif = {
      id,
      message,
      type,
      timestamp: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    };
    await saveDocument('notifications', id, newNotif);
    setActiveToast({ message, type });
  };

  // Handle Dress addition/updates/deletion
  const handleAddDress = async (newDress: Omit<Dress, 'id'>) => {
    const id = `d-${Date.now()}`;
    const dress: Dress = {
      ...newDress,
      id
    };
    await saveDocument('dresses', id, dress);
  };

  const handleUpdateDress = async (updatedDress: Dress) => {
    await saveDocument('dresses', updatedDress.id, updatedDress);
  };

  const handleDeleteDress = async (id: string) => {
    // Optionally alert if dress has active bookings
    const hasActiveBookings = bookings.some(b => b.dressId === id && b.status !== 'Annulé');
    if (hasActiveBookings) {
      alert("Attention: Cette robe possède des réservations enregistrées. Veuillez vérifier vos contrats.");
    }
    await deleteDocument('dresses', id);
  };

  // Handle Client additions
  const handleAddClient = async (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    const id = `c-${Date.now()}`;
    const client: Client = {
      ...newClient,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await saveDocument('clients', id, client);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    await saveDocument('clients', updatedClient.id, updatedClient);
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    // Check if client has active bookings
    const hasActiveBookings = bookings.some(b => b.clientPhone === client.phone && b.status !== 'Annulé');
    if (hasActiveBookings) {
      if (!confirm("Attention : Cette cliente possède des réservations actives. Supprimer sa fiche supprimera uniquement ses coordonnées du répertoire mais conservera l'historique de ses contrats. Continuer ?")) {
        return;
      }
    } else {
      if (!confirm(`Confirmer la suppression de la fiche de ${client.name} ?`)) {
        return;
      }
    }
    await deleteDocument('clients', id);
  };

  // Handle Booking additions/updates/deletions
  const handleOpenNewBooking = () => {
    setEditingBooking(null);
    setIsBookingFormOpen(true);
  };

  const handleOpenEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsBookingFormOpen(true);
  };

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id'> & { id?: string }) => {
    const today = getTodayDateString();

    // 1. Logique temporelle et statuts (Maison Zeyna rules)
    if (bookingData.status === 'Récupéré' && today < bookingData.startDate) {
      alert(`Impossible de soumettre : le statut ne peut pas être 'Récupéré' car la date actuelle (${today}) est antérieure à la date de début de location (${bookingData.startDate}).`);
      return;
    }

    if (bookingData.status === 'Retourné' && today < bookingData.endDate) {
      alert(`Impossible de soumettre : le statut ne peut pas être 'Retourné' car la date actuelle (${today}) est antérieure à la date de fin de location (${bookingData.endDate}).`);
      return;
    }

    // If status is 'Retourné', settle payment
    const finalBookingData = {
      ...bookingData,
      paymentStatus: bookingData.status === 'Retourné' ? 'Payé' as const : bookingData.paymentStatus,
      depositPaid: bookingData.status === 'Retourné' ? bookingData.totalPrice : bookingData.depositPaid
    };

    if (bookingData.id) {
      const oldBooking = bookings.find(b => b.id === bookingData.id);
      // Editing existing booking
      if (oldBooking) {
        if (oldBooking.status === 'Retourné' && bookingData.status !== 'Retourné') {
          alert("Ce contrat est déjà classé comme 'Retourné' (terminé). Aucun changement de statut n'est permis.");
          return;
        }
        if (oldBooking.status === 'Annulé' && bookingData.status !== 'Annulé') {
          alert("Ce contrat est déjà 'Annulé'. Aucun changement de statut n'est permis.");
          return;
        }
        if (oldBooking.status === 'Récupéré' && (bookingData.status === 'Confirmé' || bookingData.status === 'Annulé')) {
          alert("La robe a déjà été récupérée. Vous ne pouvez pas revenir en arrière à 'Confirmé' ou 'Annulé'. Le seul statut possible est 'Retourné'.");
          return;
        }

        // Keep existing payments and calculate changes
        let updatedPayments = [...(oldBooking.payments || [])];
        const diff = finalBookingData.depositPaid - oldBooking.depositPaid;
        if (diff > 0) {
          updatedPayments.push({
            amount: diff,
            date: today,
            type: finalBookingData.depositPaid === finalBookingData.totalPrice ? 'Solde' : 'Régularisation'
          });
        } else if (diff < 0) {
          updatedPayments.push({
            amount: diff,
            date: today,
            type: 'Régularisation' as const
          });
        }

        const mergedBooking: Booking = {
          ...finalBookingData,
          id: bookingData.id,
          payments: updatedPayments
        };

        await saveDocument('bookings', bookingData.id, mergedBooking);
      }
      
      // Auto-update dress status if reservation is active
      const dress = dresses.find(d => d.id === bookingData.dressId);
      if (dress) {
        let newStatus = dress.status;
        if (bookingData.status === 'Récupéré') {
          newStatus = 'Louée';
          if (oldBooking && oldBooking.status !== 'Récupéré') {
            await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est sortie. Récupérée par la cliente ${bookingData.clientName} (Tél: ${bookingData.clientPhone}). Retour prévu le ${bookingData.endDate}.`, 'out');
          }
        } else if (bookingData.status === 'Retourné') {
          newStatus = 'En Nettoyage';
          if (oldBooking && oldBooking.status !== 'Retourné') {
            await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est revenue. Retournée par la cliente ${bookingData.clientName} (Tél: ${bookingData.clientPhone}). Reste à payer réglé. La robe est maintenant En Nettoyage.`, 'in');
          }
        } else if (bookingData.status === 'Annulé') {
          newStatus = 'Disponible';
          if (oldBooking && oldBooking.status !== 'Annulé') {
            await addNotification(`La réservation de la robe "${dress.name}" (N° ${dress.number}) pour ${bookingData.clientName} a été annulée.`, 'in');
          }
        }
        if (newStatus !== dress.status) {
          await handleUpdateDress({ ...dress, status: newStatus });
        }
      }
    } else {
      // Creating a new booking
      const initialPayments = [];
      if (finalBookingData.depositPaid > 0) {
        initialPayments.push({
          amount: finalBookingData.depositPaid,
          date: today,
          type: 'Acompte' as const
        });
      }

      const id = `b-${Date.now()}`;
      const newBooking: Booking = {
        ...finalBookingData,
        id,
        payments: initialPayments
      };
      await saveDocument('bookings', id, newBooking);

      // Check if client already exists in our clients list by phone, if not auto-add them!
      const clientExists = clients.some(c => c.phone.trim().replace(/\s+/g, '') === bookingData.clientPhone.trim().replace(/\s+/g, ''));
      if (!clientExists) {
        await handleAddClient({
          name: bookingData.clientName,
          phone: bookingData.clientPhone,
          city: bookingData.clientCity,
          notes: 'Ajoutée automatiquement via une réservation.'
        });
      }

      // Auto-update dress status and add alert
      const dress = dresses.find(d => d.id === bookingData.dressId);
      if (dress) {
        if (bookingData.status === 'Récupéré') {
          await handleUpdateDress({ ...dress, status: 'Louée' });
          await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est sortie. Récupérée par la cliente ${bookingData.clientName} (Tél: ${bookingData.clientPhone}). Retour prévu le ${bookingData.endDate}.`, 'out');
        } else if (bookingData.status === 'Retourné') {
          await handleUpdateDress({ ...dress, status: 'En Nettoyage' });
          await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est revenue. Retournée par la cliente ${bookingData.clientName} (Tél: ${bookingData.clientPhone}). La robe est maintenant En Nettoyage.`, 'in');
        } else {
          await addNotification(`Nouvelle réservation de la robe "${dress.name}" (N° ${dress.number}) enregistrée pour ${bookingData.clientName} (du ${bookingData.startDate} au ${bookingData.endDate}).`, 'in');
        }
      }
    }
    setIsBookingFormOpen(false);
  };

  const handleDeleteBooking = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      if (booking.status === 'Confirmé' || booking.status === 'Récupéré') {
        const dress = dresses.find(d => d.id === booking.dressId);
        if (dress) {
          await handleUpdateDress({ ...dress, status: 'Disponible' });
        }
      }
    }
    await deleteDocument('bookings', id);
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const oldStatus = booking.status;
    if (oldStatus === status) return;

    const today = getTodayDateString();

    // 1. Logique temporelle et statuts (Maison Zeyna rules)
    if (status === 'Récupéré' && today < booking.startDate) {
      alert(`Impossible de passer le statut à 'Récupéré' : la date actuelle (${today}) est antérieure à la date de début de location (${booking.startDate}).`);
      return;
    }

    if (status === 'Retourné' && today < booking.endDate) {
      alert(`Impossible de passer le statut à 'Retourné' : la date actuelle (${today}) est antérieure à la date de fin de location (${booking.endDate}).`);
      return;
    }

    // Enforce workflow:
    if (oldStatus === 'Retourné') {
      alert("Ce contrat est déjà classé comme 'Retourné' (terminé). Aucun changement de statut n'est permis.");
      return;
    }
    if (oldStatus === 'Annulé') {
      alert("Ce contrat est déjà 'Annulé'. Aucun changement de statut n'est permis.");
      return;
    }
    if (oldStatus === 'Récupéré' && (status === 'Confirmé' || status === 'Annulé')) {
      alert("La robe a déjà été récupérée. Vous ne pouvez pas revenir à 'Confirmé' ou 'Annulé'. Uniquement 'Retourné'.");
      return;
    }

    // Update booking status and payments list
    let updatedPayments = [...(booking.payments || [])];
    let depositPaid = booking.depositPaid;
    let paymentStatus = booking.paymentStatus;

    if (status === 'Retourné') {
      const remaining = booking.totalPrice - booking.depositPaid;
      if (remaining > 0) {
        updatedPayments.push({
          amount: remaining,
          date: today,
          type: 'Solde' as const
        });
      }
      depositPaid = booking.totalPrice;
      paymentStatus = 'Payé';
    }

    const updatedBooking = {
      ...booking,
      status,
      paymentStatus,
      depositPaid,
      payments: updatedPayments
    };

    await saveDocument('bookings', id, updatedBooking);

    // Side-effects on dress status
    const dress = dresses.find(d => d.id === booking.dressId);
    if (dress) {
      if (status === 'Récupéré') {
        await handleUpdateDress({ ...dress, status: 'Louée' });
        await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est sortie. Récupérée par la cliente ${booking.clientName} (Tél: ${booking.clientPhone}). Retour prévu le ${booking.endDate}.`, 'out');
      } else if (status === 'Retourné') {
        await handleUpdateDress({ ...dress, status: 'En Nettoyage' });
        await addNotification(`La robe "${dress.name}" (N° ${dress.number}) est revenue. Retournée par la cliente ${booking.clientName} (Tél: ${booking.clientPhone}). Reste à payer réglé. La robe est maintenant En Nettoyage.`, 'in');
      } else if (status === 'Annulé') {
        await handleUpdateDress({ ...dress, status: 'Disponible' });
        await addNotification(`La réservation de la robe "${dress.name}" (N° ${dress.number}) pour la cliente ${booking.clientName} a été annulée.`, 'in');
      }
    }
  };

  const handleUpdatePaymentStatus = async (id: string, paymentStatus: Booking['paymentStatus']) => {
    const today = getTodayDateString();
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    let updatedPayments = [...(booking.payments || [])];
    let depositPaid = booking.depositPaid;

    if (paymentStatus === 'Payé' && booking.paymentStatus !== 'Payé') {
      const remaining = booking.totalPrice - booking.depositPaid;
      if (remaining > 0) {
        updatedPayments.push({
          amount: remaining,
          date: today,
          type: 'Solde' as const
        });
      }
      depositPaid = booking.totalPrice;
    }

    const updatedBooking = {
      ...booking,
      paymentStatus,
      depositPaid,
      payments: updatedPayments
    };

    await saveDocument('bookings', id, updatedBooking);
  };

  // Real-time checklists & signatures updates
  const handleUpdateChecklist = async (bookingId: string, itemKey: string) => {
    const currentItems = checklists[bookingId] || {};
    const updatedItems = {
      ...currentItems,
      [itemKey]: !currentItems[itemKey]
    };
    await saveDocument('checklists', bookingId, { items: updatedItems });
  };

  const handleUpdateSignature = async (bookingId: string, clientName: string) => {
    const todayStr = new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' });
    const signatureData = {
      signed: true,
      date: todayStr,
      name: clientName
    };
    await saveDocument('signatures', bookingId, signatureData);
  };

  // Export Data as JSON file backup
  const handleExportBackup = () => {
    const backupData = {
      dresses,
      clients,
      bookings,
      notifications,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `maison_zeyna_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Data from JSON file backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.dresses && parsed.clients && parsed.bookings) {
            if (confirm("Voulez-vous écraser vos données actuelles avec cette sauvegarde ? Toutes les modifications locales non sauvegardées seront perdues.")) {
              setDbLoading(true);
              for (const d of parsed.dresses) {
                await saveDocument('dresses', d.id, d);
              }
              for (const c of parsed.clients) {
                await saveDocument('clients', c.id, c);
              }
              for (const b of parsed.bookings) {
                await saveDocument('bookings', b.id, b);
              }
              if (parsed.notifications) {
                for (const n of parsed.notifications) {
                  await saveDocument('notifications', n.id, n);
                }
              }
              alert("Importation réussie et synchronisée avec le Cloud !");
              setDbLoading(false);
            }
          } else {
            alert("Format de fichier invalide. Assurez-vous d'importer un fichier de sauvegarde officiel.");
          }
        } catch (err) {
          alert("Erreur lors de la lecture du fichier de sauvegarde.");
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased">
      {/* Top Navy Blue & Gold Header */}
      <header className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 border-b border-gold-500/30 text-white shadow-md relative overflow-hidden">
        {/* Decorative Gold top border */}
        <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-600"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <img
                src={logoZeyna}
                alt="Maison Zeyna Logo"
                className="w-14 h-14 rounded-full object-cover border-2 border-gold-400 shadow-xl bg-black"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-gold-400 to-gold-600 p-1 rounded-full border border-gold-300">
                <Sparkles className="w-3 text-navy-950 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-extrabold tracking-wide text-gold-100">
                  Maison Zeyna
                </h1>
                <span className="bg-gold-500/20 text-gold-300 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border border-gold-500/30 uppercase">
                  Algérie
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border border-emerald-500/30 uppercase flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Temps Réel Actif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 font-medium">
                Gestion de Calendrier, Réservations & Catalogue de Robes Traditionnelles
              </p>
            </div>
          </div>

          {/* Header Action Buttons (Backup and Quick Actions) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Backup actions */}
            <div className="flex items-center gap-1.5 bg-navy-950/60 p-1 rounded-lg border border-navy-800/50">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-navy-900 rounded text-xs font-semibold text-stone-200 hover:text-white transition-all"
                title="Exporter toutes les données de location"
              >
                <Download className="w-3.5 h-3.5 text-gold-400" />
                Sauvegarder
              </button>
              
              <label
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-navy-900 rounded text-xs font-semibold text-stone-200 hover:text-white cursor-pointer transition-all"
                title="Importer une sauvegarde"
              >
                <Upload className="w-3.5 h-3.5 text-gold-400" />
                Restaurer
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Global Quick Reservation button */}
            <button
              onClick={handleOpenNewBooking}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-lg border border-gold-300/25"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Réservation
            </button>
          </div>
        </div>
      </header>

      {/* Main App Navigation Tabs */}
      <div className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'dashboard'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Tableau de Bord
            </button>

            <button
              onClick={() => setCurrentTab('calendar')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'calendar'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendrier Interactif
            </button>

            <button
              onClick={() => setCurrentTab('bookings')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'bookings'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Gérer les Contrats
            </button>

            <button
              onClick={() => setCurrentTab('catalog')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'catalog'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Garde-Robe (Catalogue)
            </button>

            <button
              onClick={() => setCurrentTab('jewelry')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'jewelry'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Gem className="w-4 h-4 text-amber-500" />
              Bijoux d'Exception
            </button>

            <button
              onClick={() => setCurrentTab('finance')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'finance'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Coins className="w-4 h-4 text-emerald-500" />
              Gestion Financière
            </button>

            <button
              onClick={() => setCurrentTab('clients')}
              className={`flex items-center gap-2 pb-1 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                currentTab === 'clients'
                  ? 'border-gold-600 text-navy-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Fiches Clientes
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Pane */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {dbLoading && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white border border-gold-500/20 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 space-y-4">
              <div className="relative flex items-center justify-center mx-auto w-12 h-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
                <CloudLightning className="w-5 h-5 text-navy-950 absolute" />
              </div>
              <h3 className="font-serif font-extrabold text-navy-950 text-lg">Maison Zeyna</h3>
              <p className="text-sm text-stone-600">Connexion sécurisée au nuage en cours...</p>
              <p className="text-xs text-stone-400">Synchronisation des robes, réservations, bijoux et fiches clientes en temps réel.</p>
            </div>
          </div>
        )}

        {/* Information Callout Banner for Applet Demonstration */}
        <div className="bg-emerald-50/50 border-l-4 border-emerald-500 rounded-r-lg p-3.5 mb-6 text-stone-600 text-xs flex gap-3 shadow-sm">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-850">Maison Zeyna - Mode Cloud Temps Réel :</span> Toutes les données (réservations, robes, clientes, bijoux et finances) sont désormais <strong>synchronisées sur Firebase Firestore en temps réel</strong>. Les modifications apportées sur cet appareil se propagent instantanément sur tous les autres navigateurs et écrans connectés.
          </div>
        </div>

        {/* Tab Selection */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Statistics Bar */}
            <DashboardStats dresses={dresses} bookings={bookings} onCardClick={setCurrentTab} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Daily Actions & Quick Calendar View */}
              <div className="lg:col-span-2 space-y-6">
                <DailyEvents 
                  bookings={bookings} 
                  dresses={dresses} 
                  onUpdateBookingStatus={handleUpdateBookingStatus}
                />

                <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base">Vue d'ensemble rapide</h3>
                      <p className="text-xs text-stone-400">Vos engagements et locations en cours</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('calendar')}
                      className="text-xs font-bold text-navy-700 hover:underline"
                    >
                      Ouvrir le calendrier complet →
                    </button>
                  </div>
                  <CalendarView 
                    bookings={bookings} 
                    dresses={dresses} 
                    onUpdateBookingStatus={handleUpdateBookingStatus}
                    onUpdatePaymentStatus={handleUpdatePaymentStatus}
                  />
                </div>
              </div>

              {/* Real-time Outings & Returns Alerts Panel */}
              <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[400px]">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Alerte Sorties / Retours
                      </h3>
                      <p className="text-xs text-stone-400">Suivi en temps réel des flux de robes</p>
                    </div>
                  </div>

                  {/* List of alerts */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                           key={notif.id}
                          className={`p-3 rounded-lg border text-xs leading-relaxed transition-all duration-300 ${
                            notif.type === 'out'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-900'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <span className="font-bold flex items-center gap-1">
                              {notif.type === 'out' ? '📤 Robe Sortie (Louée)' : '📥 Robe Retournée'}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">{notif.timestamp}</span>
                          </div>
                          <p className="font-medium text-stone-700">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-stone-400">
                        <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs font-medium">Aucune alerte enregistrée</p>
                        <p className="text-[10px] mt-1 text-stone-400">Les sorties et retours de robes s'afficheront ici automatiquement.</p>
                      </div>
                    )}
                  </div>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('Voulez-vous effacer tout l’historique des alertes ?')) {
                        for (const n of notifications) {
                          await deleteDocument('notifications', n.id);
                        }
                      }
                    }}
                    className="w-full mt-4 text-center py-2 text-[10px] uppercase font-bold text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors border border-dashed border-stone-200"
                  >
                    Effacer l'historique d'alertes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'calendar' && (
          <CalendarView 
            bookings={bookings} 
            dresses={dresses} 
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingList
            bookings={bookings}
            dresses={dresses}
            jewelry={jewelry}
            checklists={checklists}
            signatures={signatures}
            onUpdateChecklist={handleUpdateChecklist}
            onUpdateSignature={handleUpdateSignature}
            onEditBooking={handleOpenEditBooking}
            onDeleteBooking={handleDeleteBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        )}

        {currentTab === 'catalog' && (
          <DressCatalog
            dresses={dresses}
            onAddDress={handleAddDress}
            onUpdateDress={handleUpdateDress}
            onDeleteDress={handleDeleteDress}
          />
        )}

        {currentTab === 'jewelry' && (
          <JewelryCatalog
            jewelry={jewelry}
            onAddJewelry={async (newJewel) => {
              const id = `jewelry-${Date.now()}`;
              const withId = { ...newJewel, id };
              await saveDocument('jewelry', id, withId);
            }}
            onUpdateJewelry={async (updatedJewel) => {
              await saveDocument('jewelry', updatedJewel.id, updatedJewel);
            }}
            onDeleteJewelry={async (id) => {
              await deleteDocument('jewelry', id);
            }}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceManager
            bookings={bookings}
            expenses={expenses}
            withdrawals={withdrawals}
            onAddExpense={async (newExp) => {
              const id = `expense-${Date.now()}`;
              const withId = { ...newExp, id };
              await saveDocument('expenses', id, withId);
            }}
            onDeleteExpense={async (id) => {
              await deleteDocument('expenses', id);
            }}
            onAddWithdrawal={async (newWith) => {
              const id = `withdrawal-${Date.now()}`;
              const withId = { ...newWith, id };
              await saveDocument('withdrawals', id, withId);
            }}
            onDeleteWithdrawal={async (id) => {
              await deleteDocument('withdrawals', id);
            }}
          />
        )}

        {currentTab === 'clients' && (
          <ClientList
            clients={clients}
            bookings={bookings}
            dresses={dresses}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}
      </main>

      {/* Floating Action Button for mobile easy reach */}
      <button
        onClick={handleOpenNewBooking}
        className="fixed bottom-6 right-6 z-40 lg:hidden p-4 bg-navy-900 hover:bg-navy-950 text-gold-400 rounded-full shadow-2xl transition-all hover:scale-105 border border-gold-500/20"
        title="Créer une réservation"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Global Booking Form Drawer/Modal */}
      {isBookingFormOpen && (
        <BookingForm
          dresses={dresses}
          bookings={bookings}
          jewelry={jewelry}
          editingBooking={editingBooking}
          onClose={() => setIsBookingFormOpen(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Floating Toast Alert Notification */}
      {activeToast && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-50 max-w-sm bg-stone-900 border border-gold-500/20 shadow-2xl rounded-xl p-4 flex gap-3 text-white transition-all duration-300">
          <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${
            activeToast.type === 'out' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Alerte Mouvement</h4>
            <p className="text-xs text-stone-200 mt-1 leading-relaxed">{activeToast.message}</p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-stone-400 hover:text-white self-start p-1 hover:bg-stone-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer bar */}
      <footer className="bg-stone-50 border-t border-stone-200 py-6 mt-12 text-center text-xs text-stone-400">
        <p className="font-medium">Maison Zeyna — Système de gestion de robes de mariée d'Algérie</p>
        <p className="mt-1">Alger, Oran, Constantine, Tlemcen, Tizi-Ouzou, Ghardaïa</p>
      </footer>
    </div>
  );
}
