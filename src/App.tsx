import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, STATUS, Step } from 'react-joyride';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer
} from 'recharts';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  User, 
  TrendingUp, 
  Zap,
  Plus, 
  Minus,
  Save,
  CheckCircle2,
  LogOut, 
  ChevronRight,
  ChevronLeft,
  Camera,
  Download,
  Users,
  Home,
  CreditCard,
  BarChart3,
  Star,
  Layers,
  RefreshCw,
  ChevronDown,
  Palmtree,
  Sword,
  Settings,
  Library,
  MessageSquare,
  Send,
  X,
  Globe,
  Trophy,
  Medal,
  Lock,
  Award,
  Shield,
  ExternalLink,
  Package,
  Expand,
  Maximize,
  Binary,
  Info,
  Swords,
  Gem,
  Diamond,
  Store,
  Coffee
} from 'lucide-react';
import { collection, query, onSnapshot, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocFromServer, writeBatch, getCountFromServer } from 'firebase/firestore';
import { db, auth, googleProvider, handleFirestoreError, OperationType, isQuotaError } from './firebase';
import { signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from './AuthContext';
import emailjs from '@emailjs/browser';

const APP_VERSION = '5.0.2';

const CATEGORY_BG: Record<string, string> = {
  'box': '/fondobox.jpg',
  'decks': '/fondodecks.jpg',
  'expansions': '/fondoexpansion-1.jpg',
  'promos': '/fondopromos.jpg',
  'coleccionismo': '/fondocoleccionismo-1.jpg',
  'energy-markers': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/E-42.webp?v1',
  'playmats': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2024/09/03/h5ChG0qML4QTah6S/FW_DB40th_PlayMat_dummy_s.png',
  'tournament-packs': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/f9sCr873KqqohGQX/EN_FW_FB04-104_Battle_SR_PARA_dummy.webp',
  'anniversary': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/MinCeQqNOsOKDmcT/EN_FW_FB03-125_Battle_SR_PARA_dummy.webp',
  'championship-2024': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/E-42.webp?v1',
  'sleeves': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/9kIScwUijTQ7mUsA/FW_CHAMPIONSHIP_sleeve_wave1_dummy.png?_=',
  'premium': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_f_p1.webp',
  'cases': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/EwzftqLxABcsbbzQ/set.png',
  'accessories': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/SO7IRc932UC2usKA/set.png',
  'UB_FOLDER_MAIN': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/05/15/ymjpMgIsvOoUsSOS/EN_FW_FB01-096_Battle_SR_RE_dummy_s1.png?_='
};

const SET_BG: Record<string, string> = {
  'BT1': '/galacticbattle.png',
  'BT2': '/unionforce.jpg',
  'BT3': '/crossworlds.png',
  'BT4': '/colossalwarfare.png',
  'BT5': '/miraculousrevival.jpg',
  'BT6': '/destroyerkings.png',
  'BT7': '/assaultofthesaiyans.jpg',
  'BT8': '/maliciousmachinations.jpg',
  'BT9': '/universalonslaught.jpg',
  'BT10': '/riseoftheunisonwarrior.jpg',
  'BT11': '/vermilionbloodline.jpg',
  'BT12': '/viciousrejuvenation.jpg',
  'BT13': '/supremerivalry.jpg',
  'BT14': '/crossspirits.jpg',
  'BT15': '/saiyanshowdown.jpg',
  'BT16': '/realmofthegods.jpg',
  'BT17': '/ultimatesquad.jpg',
  'BT18': '/dawnofthezlegends.jpg',
  'BT19': '/fightersambition.webp',
  'BT20': '/powerabsorbed.jpg',
  'BT21': '/wildresurgence.jpg',
  'BT22': '/criticalblow.webp',
  'BT23': '/perfectcombination.jpg',
  'BT24': '/beyondgenerations.jpg',
  'BT25': '/legendofthedragonballs.jpg',
  'BT26': '/ultimateadvent.jpg',
  'BT27': '/historyofz.jpg',
  'BT28': '/prismaticclash.jpg',
  'BT29': '/fearsomerivals.webp',
  'BT30': '/threegloriousfighters.webp',
  'TB1': '/the_tournament_of_power.png',
  'TB2': '/worldmartialartstournament.png',
  'TB3': '/clashoffates.jpg',
  'EB1': '/battleevolutionbooster.webp',
  'DB1': '/dragonbrawl.jpg',
  'DB2': '/divinemultiverse.jpg',
  'DB3': '/giantforce.webp',
  'SD1': '/theawakening.jpg',
  'SD2': '/extremeevolution.png',
  'SD3': '/darkinvasion.jpg',
  'SD4': '/theguardianofnamekians.jpg',
  'SD5': '/crimsonsaiyan.jpg',
  'SD6': '/resurrectedfusion.jpg',
  'SD7': '/shenronsadvent.jpg',
  'SD8': '/risingbroly.jpg',
  'SD9': '/saiyanlegacy.png',
  'SD10': '/parasiticoverlord.png',
  'SD11': '/instinctsurpassed.jpg',
  'SD12': '/spiritofpotara.jpg',
  'SD13': '/clancolussion.jpg',
  'SD14': '/saiyanwonder.png',
  'SD15': '/prideofthesaiyans.png',
  'SD16': '/darknessreborn.png',
  'SD17': '/redrage.jpg',
  'SD18': '/bluefuture.jpg',
  'SD19': '/greenfusion.jpg',
  'SD20': '/yellowtransformation.png',
  'SD21': '/ultimateawakenedpower.jpg',
  'SD22': '/proudwarrior.jpg',
  'SD23': '/finalradiance.png',
  'XD1': '/universe6assailants.jpg',
  'XD2': '/android_duality.jpg',
  'XD3': '/ultimatelifeform.png',
  'COL01': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-001-celebrations-high-rank-player.webp',
  'ENM': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'COL08': '/BT1-111_PR02.png',
  'COL03': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-01-shadow-token.webp',
  'FS01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/0JYpHsOgXNKBIVZo/FS01.png',
  'FS02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/7bAhAB1xTlIkACRO/FS02.png',
  'FS03': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/lDijgGD9sNgAJ526/FS03.png',
  'FS04': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/EWmY0UQexasYyBcu/FS04.png',
  'FS05': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/vk4KRkbLTeK67SY3/FS05.png',
  'FS06': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/MPNeBICdnlm3BYoQ/FS06.png',
  'FS07': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/uRZ7VwVGj1sUOphO/FS07.png',
  'FS08': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/02/05/O9dVggbjsfdOXlIq/FS08.png',
  'FS09': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/05/21/wozb8VBEY0R5e6PV/FS09.png',
  'FS10': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/05/21/6M1LHunLr3sp5zNe/FS10_en.png',
  'FS11': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/01/07/zbWLU6s5chJjCGWi/FS11.png',
  'FS12': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/01/07/8QtfKLrXGRlNkKvE/FS12_jp.png',
  'FB01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/jvH8MiiPf2XJ2dGV/FB01.png',
  'FB02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/M7HClkTQ56OBGybA/FB02_en.png',
  'FB03': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/srq3Ydq35EDVEdoE/FB03_en.png',
  'FB04': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/mVfgBLYmhYbbJMER/FB04.png',
  'FB05': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/28/ZePngwMDfOSFUiWN/FB05.png',
  'FB06': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/02/03/kUojrv7IQ7GcUj53/FB06.png',
  'FB07': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/M3LgrWwQ7EgG87eg/FB07.png',
  'FB08': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/17/8lb43IDYb8Hxk7e0/FB08.png',
  'FB09': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/12/17/pMRcttD9S1974seK/FB09.webp',
  'SB01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/05/02/nBCg0NGTfrlDxjTh/SB01.png',
  'SB02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/07/15/juWqXLzujCKVtKRM/SB02.png',
  'ST01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/04/16/wjNNKPFHb03XRs2y/ST01.png',
  'FB10': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/06/JS4ULo0ymDGIxniT/FB10_en.png',
  'PM01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/19/VqCUMN4dxFjbIcp6/thumbnail_en.webp',
  'PM02': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2024/09/03/h5ChG0qML4QTah6S/FW_DB40th_PlayMat_dummy_s.png',
  'SL04': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2026/01/21/IeDlRDboddQ4vqy1/thumbnail.png',
  'SL-ILL': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/07/15/5tfav6uAZ6OTsLyL/thumbnail.png',
  'SL-ILL-SP': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/09/30/VpkKmgawLxxAM1sp/thumbnail.png',
  'SL01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/xQfxsXaOgDB8va5d/sleeve.png',
  'SL-LTD03-BULMA': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/18/U5AFzLqhvaxCHh8a/thumbnail.png',
  'SL-LTD04-GOKU': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/18/NNeMLJVYa4xUyLus/thumbnail.png',
  'SL03': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/05/08/he4GN6a9tDlsY9G2/thumbnail.png',
  'SL02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/03/0J6RzvOEaa68mXHb/sleeve02.png',
  'SL-LTD02-GOKU': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/25/UbHawtxNemzYvFZg/sleeves_limited02.png',
  'SL-LTD02-SHENRON': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/25/Khbw3O3Crkag45xW/sleeves_limited01.png',
  'CC-BARDOCK': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/EwzftqLxABcsbbzQ/set.png',
  'CC-BROLY': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/03/11/hdrXCKyfx6JN1Xey/FW_broly_dummy_s1.png?_=',
  'CC-VEGITO': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/01/10/lZ4yDQQaG7k7NVkx/FW_vegetto_cardcase_dummy_s1.png?_=',
  'CC-GOGETA': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/01/10/FQxr1BG8NVADGhcf/FW_gogeta_cardcase_dummy_s1.png?_=',
  'ACS02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/Q95wCMSqaTSlZjKf/set.png',
  'ACS01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/SO7IRc932UC2usKA/set.png',
  'FS01-01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_f.webp',
  'FS01-01_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_b.webp',
  'FS02-01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_f.webp',
  'FS02-01_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_b.webp',
  'FS03-01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_f.webp',
  'FS03-01_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_b.webp',
  'FS04-01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_f.webp',
  'FS04-01_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_b.webp',
  'FS05-01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_f.webp',
  'FS05-01_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_b.webp',
  'FB02-119': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-119.webp',
  'FB04-012': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-012.webp',
  'FB06-036': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-036.webp',
  'FB06-062': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-062.webp',
  'FB06-097': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-097.webp',
  'FS01-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_f_p1.webp',
  'FS01-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_b_p1.webp',
  'FS02-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_f_p1.webp',
  'FS02-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_b_p1.webp',
  'FS03-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_f_p1.webp',
  'FS03-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_b_p1.webp',
  'FS04-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_f_p1.webp',
  'FS04-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_b_p1.webp',
  'FS05-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_f_p1.webp',
  'FS05-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_b_p1.webp',
  'FB02-119_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-119_p3.webp?v1',
  'FB04-012_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-012_p3.webp?v1',
  'FB06-036_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-036_p1.webp?v1',
  'FB06-062_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-062_p1.webp?v1',
  'FB06-097_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-097_p3.webp?v1',
  'RE_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/cElfkJ4Rfp1L1qCI/EN_FW_FP-027_Battle_PR_TOP_dummy_s.png?_=',
  'TP01_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-06_p2.webp?v1',
  'TP01_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-06_p1.webp?v1',
  'TP01_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-06_p2.webp?v1',
  'TP02_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-077_p2.webp?v1',
  'TP02_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-077_p1.webp?v1',
  'TP02_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-077_p2.webp?v1',
  'FB03-011_BCGF': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/02/A3VziO6hMr6kTH4t/%E3%80%90FB03-011%E3%80%91Son%20Goku.png?_=',
  'FB02-007_UB_V2_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/21/JYhlFKokuS4Q89Kc/EN_FW_FB02-007_Battle_R_RE_dummy_s1.png?_=',
  'FB02-061_UB_V2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/21/CXb3Zfj5xVmvlkeq/EN_FW_FB02-061_Battle_SR_RE_dummy_s1.png?_=',
  'TP03_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-061_p2.webp?v1',
  'TP03_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-061_p1.webp?v1',
  'TP03_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-061_p2.webp?v1',
  'TP04_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-024_p2.webp?v1',
  'TP04_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-024_p1.webp?v1',
  'TP04_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-024_p2.webp?v1',
  'TP05_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-046_p2.webp?v1',
  'TP05_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-046_p1.webp?v1',
  'TP05_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-046_p2.webp?v1',
  'TP06_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-086_p2.webp?v1',
  'TP06_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-086_p1.webp?v1',
  'TP06_WINNER_VIEW': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-086_p2.webp?v1',
  'UB25-1_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/ZqGXkFNX0GIzEIN5/EN_FW_FB03-121_UB_WINNER_dummy_s.png?_=',
  'UB25-2_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/04/10/ejld3cbA4wCft2YK/EN_FW_FB05-030_Battle_SR_PARA_RE_dummy_s1_R.png?_=',
  '1ST_ANNIV_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/WXPyXZacJEuCphta/EN_FW_FB05-053_Battle_RE_dummy_s.png?_=',
  '40TH_ANNIV_FOLDER_MAIN': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/27/2ea50zIaAVQXj7oh/%E3%80%90WINNER%E3%80%91EN_FW_SB01-057_Battle_SR_dummy_s.png?_=',
  '40TH_ANNIV_VOL1_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/27/2ea50zIaAVQXj7oh/%E3%80%90WINNER%E3%80%91EN_FW_SB01-057_Battle_SR_dummy_s.png?_=',
  '40TH_ANNIV_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/27/2ea50zIaAVQXj7oh/%E3%80%90WINNER%E3%80%91EN_FW_SB01-057_Battle_SR_dummy_s.png?_=',
  'LP01_FOLDER': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB01-053_p2.webp?v1',
  'RE_SB01_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/12/nG0BNZXtCeMjhmhN/EN_FW_FP-049_Battle_PR_TOP_dummy_s.png?_=',
  
  'AS2025': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/EdgUH3ACmi7DqQsH/EN_FW_FS03-16_Extra_C_PARA_dummy.webp',
  'CP01_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/26/bbppxPiBXGySaAx4/ChampionshipPack_01_dummy.png?_=',
  'CP01_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/26/bbppxPiBXGySaAx4/ChampionshipPack_01_dummy.png?_=',
  'CP01_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/26/bbppxPiBXGySaAx4/ChampionshipPack_01_dummy.png?_=',
  'CP02_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/Q9gEnVAJPuDW6Oe8/ChampionshipPack_02-dummy.png?_=',
  'CP02_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/Q9gEnVAJPuDW6Oe8/ChampionshipPack_02-dummy.png?_=',
  'CP02_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/Q9gEnVAJPuDW6Oe8/ChampionshipPack_02-dummy.png?_=',
  'CP03_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/x1JlIbQCaRDVlTYE/ChampionshipPack_03_dummy.png?_=',
  'CP03_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/x1JlIbQCaRDVlTYE/ChampionshipPack_03_dummy.png?_=',
  'CP03_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/QkXmqcQ9e1m9izLV/ChampionshipPack_03_FINALIST_dummy.png?_=',
  'SP01_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/3Be5453plg5PYCUV/SelectionPack_01_dummy.png?_=',
  'SP01_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/3Be5453plg5PYCUV/SelectionPack_01_dummy.png?_=',
  'SP01_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/c7luXuU0RJh2VOID/SelectionPack_01_FINALIST_dummy.png?_=',
  'PM-CH-FINALS24': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/jkPK5Db2R8Mc3OeJ/FW_FINALS_PlayMat_dummy_s.png?_=',
  'PM-CH-GF24': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/O12MLkTmtVACXaht/FW_GRANDFINALS_PlayMat_dummy_s1.png?_=',
  'TR_FINALS_24': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-129_p2.webp?v1',
  'TR_GRAND_FINALS_24': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/0X8hYNPOO9yEn5XD/EN_FW_FP-034_Battle_GF_trophy_1st_dummy%EF%BC%88%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E7%84%A1%E3%81%97%EF%BC%89.png?_=',
  'SL-CH-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/9kIScwUijTQ7mUsA/FW_CHAMPIONSHIP_sleeve_wave1_dummy.png?_=',
  'SL-CH-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/Ju7bjBR2JTAyejO0/FW_CHAMPIONSHIP_sleeve_wave1_dummy_s.png?_=',
  'PM-CH-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/bpzkY5QiMzlJVRCN/FW_CHAMPIONSHIP_dummy.png?_=',
  'PM-CH-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/GPPbDeDEuZOTChL8/FW_CHAMPIONSHIP_595%C3%97340mm_dummy_S.png?_=',
  'CP_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/uO3dSaidPNSES1DP/EN_FW_FB02-133_Battle_SR_RE_dummy.png?_=',
  'CP_W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/21/mvAKAMuUD6gcnjXv/EN_FW_FB03-064_Battle_SR_RE_dummy_sample.png?_=',
  'ACC25_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/MKimgAngwNNNmDeH/FW_Championship25_sleeve_dummy_s1.png?_=',
  'CH25_W1_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/ReK59w0AjEdDCeKK/EN_FW_FB04-094_Battle_SR_PARA_RE_dummy_s1.png?_=',
  'LP25_01_NORMAL': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/wIqwg5O1ttSHGi1J/EN_FW_FB02-029_Battle_UC-PARA_dummy_s1.png?_=',
  'LP25_01_WINNER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/BmdGg9pOLCAJcnlw/EN_FW_FB02-029_Battle_UC-PARA_RARE_dummy_s1.png?_=',
  'CP25_W1_TOP': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/1ZgkrMHur99gwJrA/EN_FW_FB04-130_Battle_SCR_PARA_RE_dummy_s1.png?_=',
  'SL-CH25-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/MKimgAngwNNNmDeH/FW_Championship25_sleeve_dummy_s1.png?_=',
  'PM-CH25-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/1PB3zAVz9yRiuEEd/FW_Championship_W_PlayMat_dummy_s5.png?_=',
  'CP25_W2_TOP': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/BrVypixviIelgtzW/EN_FW_SB01-012_Battle_SR_PARA_dummy_s_R.png?_=',
  'CH25_W2_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/BrVypixviIelgtzW/EN_FW_SB01-012_Battle_SR_PARA_dummy_s_R.png?_=',
  'CH25_FINALS_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/EBjkoxmAdji5mbVZ/EN_FW_FB04-129_Battle_SCR_PARA_dummy_s.webp',
  'CH25_GFINALS_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/10/29/J9CjHAWSpJBWeV1H/EN_FW_FB07-122_Battle_TOP3_trophy_Champion_dummy.webp',
  'LP25_02_NORMAL': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/jCh2vV8bWW3NIAqF/EN_FW_FB03-123_Battle_UC_dummy_s1_R.png?_=',
  'LP25_02_WINNER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/qjj1DNT0Hr8vfl8H/EN_FW_FB03-123_Battle_UC_PARA_dummy_s1_R.png?_=',
  'ACC25_W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/SmQAsUNhl27cE9Ik/FW_Championship_wave2_sleeve_dummy_s_R.png?_=',
  'SL-CH25-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/SmQAsUNhl27cE9Ik/FW_Championship_wave2_sleeve_dummy_s_R.png?_=',
  'PM-CH25-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/o3Z7Cw0z0lJ2nu3f/FW_Championship_wave2_PlayMat_dummy_s1.png?_=',
  'UB_2024_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/05/15/ymjpMgIsvOoUsSOS/EN_FW_FB01-096_Battle_SR_RE_dummy_s1.png?_=',
  'UB_2025_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/PfUcUruECPvQtknB/EN_FW_FS01-08_UB_WINNER_dummy_s.png?_=',
  'UB_2026_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/12/08/EkTQphCDKtCXGaxM/FB07-035_p2.webp'
};

const SET_BG_POS: Record<string, string> = {
  'TP01_FOLDER': 'bg-[50%_25%]',
  'TP01_NORMAL_VIEW': 'bg-[50%_25%]',
  'TP01_WINNER_VIEW': 'bg-[50%_25%]',
  'AS2025': 'bg-[50%_25%]',
  'CP01_FOLDER': 'bg-[50%_25%]',
  'UB_FOLDER_MAIN': 'bg-[50%_25%]',
  'UB_2024_FOLDER': 'bg-[50%_25%]',
  'UB_2025_FOLDER': 'bg-[50%_25%]',
  'UB_2026_FOLDER': 'bg-[50%_25%]',
  '40TH_ANNIV_FOLDER': 'bg-[50%_25%]',
  '40TH_ANNIV_VOL1_FOLDER': 'bg-[50%_25%]',
  '40TH_ANNIV_FOLDER_MAIN': 'bg-[50%_25%]',
  'CP01_NORMAL_VIEW': 'bg-[50%_25%]',
  'CP01_ALT_VIEW': 'bg-[50%_25%]',
  'SL-CH-W2': 'bg-[50%_25%]',
  'PM-CH-W2': 'bg-[50%_25%]',
  'CP02_FOLDER': 'bg-[50%_25%]',
  'CP02_NORMAL_VIEW': 'bg-[50%_25%]',
  'CP02_ALT_VIEW': 'bg-[50%_25%]',
  'CP03_FOLDER': 'bg-[50%_25%]',
  'CP03_NORMAL_VIEW': 'bg-[50%_25%]',
  'CP03_ALT_VIEW': 'bg-[50%_25%]',
  'SP01_FOLDER': 'bg-[50%_25%]',
  'SP01_NORMAL_VIEW': 'bg-[50%_25%]',
  'SP01_ALT_VIEW': 'bg-[50%_25%]',
  'TR_FINALS_24': 'bg-[50%_25%]',
  'TR_GRAND_FINALS_24': 'bg-[50%_25%]',
  'CH25_FINALS_FOLDER': 'bg-[50%_25%]',
  'CH25_GFINALS_FOLDER': 'bg-[50%_25%]',
  'CP_W2': 'bg-[50%_25%]',
  'BT2': 'bg-[50%_40%]',
  'BT5': 'bg-[50%_0%]',
  'BT6': 'bg-[50%_60%]',
  'SD1': 'bg-[50%_60%]',
  'SD2': 'bg-[50%_60%]',
  'SD3': 'bg-[50%_60%]',
  'SD4': 'bg-[50%_60%]',
  'SD5': 'bg-[50%_60%]',
  'SD6': 'bg-[50%_60%]',
  'SD7': 'bg-[50%_60%]',
  'SD8': 'bg-[50%_60%]',
  'SD9': 'bg-[50%_60%]',
  'SD10': 'bg-[50%_60%]',
  'SD11': 'bg-[50%_60%]',
  'SD12': 'bg-[50%_60%]',
  'SD13': 'bg-[50%_60%]',
  'SD14': 'bg-[50%_60%]',
  'SD15': 'bg-[50%_60%]',
  'SD16': 'bg-[50%_60%]',
  'SD17': 'bg-[50%_60%]',
  'SD18': 'bg-[50%_60%]',
  'SD19': 'bg-[50%_60%]',
  'SD20': 'bg-[50%_60%]',
  'SD21': 'bg-[50%_60%]',
  'SD22': 'bg-[50%_60%]',
  'SD23': 'bg-[50%_60%]',
  'XD1': 'bg-[50%_60%]',
  'XD2': 'bg-[50%_60%]',
  'XD3': 'bg-[50%_60%]',
  'COL01': 'bg-[50%_50%]',
  'ENM': 'bg-[50%_50%]',
  'COL08': 'bg-[50%_50%]',
  'COL03': 'bg-[50%_50%]',
  'FS01': 'bg-[50%_50%]',
  'FS02': 'bg-[50%_50%]',
  'FS03': 'bg-[50%_50%]',
  'FS04': 'bg-[50%_50%]',
  'FS05': 'bg-[50%_50%]',
  'FS06': 'bg-[50%_50%]',
  'FS07': 'bg-[50%_50%]',
  'FS08': 'bg-[50%_50%]',
  'FS09': 'bg-[50%_50%]',
  'FS10': 'bg-[50%_50%]',
  'FS11': 'bg-[50%_50%]',
  'FS12': 'bg-[50%_50%]',
  'FB01': 'bg-[50%_50%]',
  'FB02': 'bg-[50%_50%]',
  'FB03': 'bg-[50%_50%]',
  'FB04': 'bg-[50%_50%]',
  'FB05': 'bg-[50%_50%]',
  'FB06': 'bg-[50%_50%]',
  'FB07': 'bg-[50%_50%]',
  'FB08': 'bg-[50%_50%]',
  'FB09': 'bg-[50%_50%]',
  'SB01': 'bg-[50%_50%]',
  'SB02': 'bg-[50%_50%]',
  'FP': 'bg-[50%_50%]',
};

const MAIN_CATEGORIES = [
  { 
    id: 'box', 
    label: { es: 'Box', en: 'Box' }, 
    icon: 'Package',
    categories: ['Booster Box', 'Themed Booster', 'Evolution Booster', 'Draft Box'] 
  },
  { 
    id: 'decks', 
    label: { es: 'Decks', en: 'Decks' }, 
    icon: 'Layers',
    categories: ['Starter Deck', 'Expert Deck'] 
  },
  { 
    id: 'expansions', 
    label: { es: 'Expansion sets', en: 'Expansion sets' }, 
    icon: 'Expand',
    categories: ['Expansion Set'] 
  },
  { 
    id: 'promos', 
    label: { es: 'Promos', en: 'Promos' }, 
    icon: 'Star',
    categories: ['Promos'] 
  },
  { 
    id: 'coleccionismo', 
    label: { es: 'Coleccionismo', en: 'Coleccionismo' }, 
    icon: 'Library',
    categories: ['Coleccionismo'] 
  },
];

const expansionGroups: ExpansionGroup[] = [
  {
    category: 'Booster Box',
    items: [
      { id: 'BT1', label: 'BT01: Galactic Battle', sub: 'Main Set' },
      { id: 'BT2', label: 'BT02: Union Force', sub: 'Main Set' },
      { id: 'BT3', label: 'BT03: Cross Worlds', sub: 'Main Set' },
      { id: 'BT4', label: 'BT04: Colossal Warfare', sub: 'Main Set' },
      { id: 'BT5', label: 'BT05: Miraculous Revival', sub: 'Main Set' },
      { id: 'BT6', label: 'BT06: Destroyer Kings', sub: 'Main Set' },
      { id: 'BT7', label: 'BT07: Assault of the Saiyans', sub: 'Main Set' },
      { id: 'BT8', label: 'BT08: Malicious Machinations', sub: 'Main Set' },
      { id: 'BT9', label: 'BT09: Universal Onslaught', sub: 'Main Set' },
      { id: 'BT10', label: 'BT10: Rise of the Unison Warrior', sub: 'Main Set' },
      { id: 'BT11', label: 'BT11: Vermilion Bloodline', sub: 'Main Set' },
      { id: 'BT12', label: 'BT12: Vicious Rejuvenation', sub: 'Main Set' },
      { id: 'BT13', label: 'BT13: Supreme Rivalry', sub: 'Main Set' },
      { id: 'BT14', label: 'BT14: Cross Spirits', sub: 'Main Set' },
      { id: 'BT15', label: 'BT15: Saiyan Showdown', sub: 'Main Set' },
      { id: 'BT16', label: 'BT16: Realm of the Gods', sub: 'Main Set' },
      { id: 'BT17', label: 'BT17: Ultimate Squad', sub: 'Main Set' },
      { id: 'BT18', label: 'BT18: Dawn of the Z-Legends', sub: 'Main Set' },
      { id: 'BT19', label: 'BT19: Fighter\'s Ambition', sub: 'Main Set' },
      { id: 'BT20', label: 'BT20: Power Absorbed', sub: 'Main Set' },
      { id: 'BT21', label: 'BT21: Wild Resurgence', sub: 'Main Set' },
      { id: 'BT22', label: 'BT22: Critical Blow', sub: 'Main Set' },
      { id: 'BT23', label: 'BT23: Perfect Combination', sub: 'Main Set' },
      { id: 'BT24', label: 'BT24: Beyond Generations', sub: 'Main Set' },
      { id: 'BT25', label: 'BT25: Legend of the Dragon Balls', sub: 'Main Set' },
      { id: 'BT26', label: 'BT26: Ultimate Advent', sub: 'Main Set' },
      { id: 'BT27', label: 'BT27: History of Z', sub: 'Main Set' },
      { id: 'BT28', label: 'BT28: Prismatic Clash', sub: 'Main Set' },
      { id: 'BT29', label: 'BT29: Fearsome Rivals', sub: 'Main Set' },
      { id: 'BT30', label: 'BT30: Three Glorious Fighters', sub: 'Main Set' }
    ]
  },
  {
    category: 'Themed Booster',
    items: [
      { id: 'TB1', label: 'TB01: The Tournament of Power', sub: 'Themed Set' },
      { id: 'TB2', label: 'TB02: World Martial Arts Tournament', sub: 'Themed Set' },
      { id: 'TB3', label: 'TB03: Clash of Fates', sub: 'Themed Set' }
    ]
  },
  {
    category: 'Evolution Booster',
    items: [
      { id: 'EB1', label: 'EB1: Battle Evolution Booster', sub: 'Main Set' }
    ]
  },
  {
    category: 'Draft Box',
    items: [
      { id: 'DB1', label: 'DB1: Dragon Brawl (DB04)', sub: 'Draft Set' },
      { id: 'DB2', label: 'DB2: Divine Multiverse (DB05)', sub: 'Draft Set' },
      { id: 'DB3', label: 'DB3: Giant Force (DB06)', sub: 'Draft Set' }
    ]
  },
  {
    category: 'Starter Deck',
    items: [
      { id: 'SD1', label: 'SD1: The Awakening', sub: 'Starter Deck' },
      { id: 'SD2', label: 'SD2: The Extreme Evolution', sub: 'Starter Deck' },
      { id: 'SD3', label: 'SD3: The Dark Invasion', sub: 'Starter Deck' },
      { id: 'SD4', label: 'SD4: The Guardian Of Namekians', sub: 'Starter Deck' },
      { id: 'SD5', label: 'SD5: The Crimson Saiyan', sub: 'Starter Deck' },
      { id: 'SD6', label: 'SD6: Resurrected Fusion', sub: 'Starter Deck' },
      { id: 'SD7', label: 'SD7: Shenron\'s Advent', sub: 'Starter Deck' },
      { id: 'SD8', label: 'SD8: Rising Broly', sub: 'Starter Deck' },
      { id: 'SD9', label: 'SD9: Saiyan Legacy', sub: 'Starter Deck' },
      { id: 'SD10', label: 'SD10: Parasitic Overlord', sub: 'Starter Deck' },
      { id: 'SD11', label: 'SD11: Instinct Surpassed', sub: 'Starter Deck' },
      { id: 'SD12', label: 'SD12: Spirit of Potara', sub: 'Starter Deck' },
      { id: 'SD13', label: 'SD13: Clan Collusion', sub: 'Starter Deck' },
      { id: 'SD14', label: 'SD14: Saiyan Wonder', sub: 'Starter Deck' },
      { id: 'SD15', label: 'SD15: Pride of the Saiyans', sub: 'Starter Deck' },
      { id: 'SD16', label: 'SD16: Darkness Reborn', sub: 'Starter Deck' },
      { id: 'SD17', label: 'SD17: Zenkai- Red Rage', sub: 'Starter Deck' },
      { id: 'SD18', label: 'SD18: Zenkai- Blue Future', sub: 'Starter Deck' },
      { id: 'SD19', label: 'SD19: Zenkai- Green Fusion', sub: 'Starter Deck' },
      { id: 'SD20', label: 'SD20: Zenkai- Yellow Transformation', sub: 'Starter Deck' },
      { id: 'SD21', label: 'SD21: Ultimate Awakened Power', sub: 'Starter Deck' },
      { id: 'SD22', label: 'SD22: Proud Warrior', sub: 'Starter Deck' },
      { id: 'SD23', label: 'SD23: Final Radiance', sub: 'Starter Deck' }
    ]
  },
  {
    category: 'Expert Deck',
    items: [
      { id: 'XD1', label: 'XD1: Universe 6 Assailants', sub: 'Expert Set' },
      { id: 'XD2', label: 'XD2: Android Duality', sub: 'Expert Set' },
      { id: 'XD3', label: 'XD3: The Ultimate Life Form', sub: 'Expert Set' }
    ]
  },
  {
    category: 'Expansion Set',
    items: [
      { id: 'EXP1', label: 'EX1: Mighty Heroes', sub: 'Expansion' },
      { id: 'EXP2', label: 'EX2: Dark Demon\'s Villains', sub: 'Expansion' },
      { id: 'EXP3', label: 'EX3: Ultimate Box', sub: 'Expansion' },
      { id: 'EXP4', label: 'EX4: Unity of Saiyans', sub: 'Expansion' },
      { id: 'EXP5', label: 'EX5: Unity of Destruction', sub: 'Expansion' },
      { id: 'EXP6', label: 'EX6: Anniversary Box 2019', sub: 'Expansion' },
      { id: 'EXP7', label: 'EX7: Fusion Hero', sub: 'Expansion' },
      { id: 'EXP8', label: 'EX8: Forsaken Warrior', sub: 'Expansion' },
      { id: 'EXP9', label: 'EX9: Saiyan Surge', sub: 'Expansion' },
      { id: 'EXP10', label: 'EX10: Namekian Surge', sub: 'Expansion' },
      { id: 'EXP11', label: 'EX11: Universe 7 Unison', sub: 'Expansion' },
      { id: 'EXP12', label: 'EX12: Universe 11 Unison', sub: 'Expansion' },
      { id: 'EXP13', label: 'EX13: Anniversary Box 2020', sub: 'Expansion' },
      { id: 'EXP14', label: 'EX14: Battle Advanced', sub: 'Expansion' },
      { id: 'EXP15', label: 'EX15: Battle Enhanced', sub: 'Expansion' },
      { id: 'EXP16', label: 'EX16: Ultimate Deck 2021', sub: 'Expansion' },
      { id: 'EXP17', label: 'EX17: Saiyan Boost', sub: 'Expansion' },
      { id: 'EXP18', label: 'EX18: Namekian Boost', sub: 'Expansion' },
      { id: 'EXP19', label: 'EX19: Anniversary Box 2021', sub: 'Expansion' },
      { id: 'EXP20', label: 'EX20: Ultimate Deck 2022', sub: 'Expansion' },
      { id: 'EXP21', label: 'EX21: Anniversary Box 2022', sub: 'Expansion' },
      { id: 'EXP22', label: 'EX22: Ultimate Deck 2023', sub: 'Expansion' },
      { id: 'EXP23', label: 'EX23: Anniversary Box 2023', sub: 'Expansion' },
      { id: 'EXP24', label: 'EX24: Anniversary Box 2024', sub: 'Expansion' },
      { id: 'EXP25', label: 'EX25: Anniversary Box 2025', sub: 'Expansion' }
    ]
  },
  {
    category: 'Promos',
    items: [
      { id: 'FP', label: 'P: Promo Cards', sub: 'Cartas especiales' },
    ]
  },
  {
    category: 'Coleccionismo',
    items: [
      { id: 'COL01', label: 'Merit Cards', sub: 'Premios de torneos' },
      { id: 'ENM', label: 'Energy Markers', sub: 'Markers' },
      { id: 'COL02', label: 'Giant Size Cards', sub: 'Próximamente', locked: true },
      { 
        id: 'COL05', 
        label: 'Event Packs', 
        sub: 'Eventos especiales',
        subItems: [
          { id: 'EP01', label: 'Event Pack 2018 (Event pack 01)', sub: '2018' },
          { id: 'EP02', label: 'Event Pack 2018 (Event pack 02)', sub: '2018' },
          { id: 'EP03', label: 'Event Pack 03', sub: 'Eventos' },
          { id: 'EP04', label: 'Event Pack 04', sub: 'Eventos' },
          { id: 'EP05', label: 'Event Pack 05', sub: 'Eventos' },
          { id: 'EP06', label: 'Event Pack 06', sub: 'Eventos' },
          { id: 'EP07', label: 'Event Pack 07', sub: 'Eventos' },
          { id: 'EP08', label: 'Event Pack 08', sub: 'Eventos' },
          { id: 'EP09', label: 'Event Pack 09', sub: 'Eventos' },
          { id: 'EP10', label: 'Event Pack 10', sub: 'Eventos' },
          { id: 'EP11', label: 'Event Pack 11', sub: 'Eventos' },
          { id: 'EP12', label: 'Event Pack 12', sub: 'Eventos' },
          { id: 'EP13', label: 'Event Pack 13', sub: 'Eventos' },
          { id: 'EP14', label: 'Event Pack 14', sub: 'Eventos' },
          { id: 'EP15', label: 'Event Pack 15', sub: 'Eventos' },
          { id: 'EP16', label: 'Event Pack 16', sub: 'Eventos' },
          { id: 'EP17', label: 'Event Pack 17', sub: 'Eventos' },
          { id: 'EP18', label: 'Event Pack 18', sub: 'Eventos' },
        ]
      },
      { 
        id: 'COL07', 
        label: 'Judge Packs', 
        sub: 'Judge Program',
        subItems: [
          { id: 'JP01', label: 'Judge Pack 01', sub: 'Judge' },
          { id: 'JP02', label: 'Judge Pack 02', sub: 'Judge' },
          { id: 'JP03', label: 'Judge Pack 03', sub: 'Judge' },
          { id: 'JP04', label: 'Judge Pack 04', sub: 'Judge' },
          { id: 'JP05', label: 'Judge Pack 05', sub: 'Judge' },
          { id: 'JP06', label: 'Judge Pack 06', sub: 'Judge' },
          { id: 'JP07', label: 'Judge Pack 07', sub: 'Judge' },
          { id: 'JP08', label: 'Judge Pack 08', sub: 'Judge' },
          { id: 'JP09', label: 'Judge Pack 09', sub: 'Judge' },
          { id: 'JP10', label: 'Judge Pack 10', sub: 'Judge' },
          { id: 'JP11', label: 'Judge Pack 11', sub: 'Judge' },
          { id: 'JP12', label: 'Judge Pack 12', sub: 'Judge' },
          { id: 'JP13', label: 'Judge Pack 13', sub: 'Judge' },
          { id: 'JP14', label: 'Judge Pack 14', sub: 'Judge' },
          { id: 'JP15', label: 'Judge Pack 15', sub: 'Judge' },
          { id: 'JP16', label: 'Judge Pack 16', sub: 'Judge' },
          { id: 'JP17', label: 'Judge Pack 17', sub: 'Judge' },
          { id: 'JP18', label: 'Judge Pack 18', sub: 'Judge' },
        ]
      },
      { id: 'COL03', label: 'Tokens', sub: 'Extras' },
      { id: 'COL04', label: 'Tapetes', sub: 'Próximamente', locked: true },
    ]
  }
];

const FUSION_CATEGORIES = [
  { 
    id: 'box', 
    label: { es: 'Box', en: 'Box' }, 
    icon: 'Package',
    categories: ['Booster Box'] 
  },
  { 
    id: 'decks', 
    label: { es: 'Starters', en: 'Starters' }, 
    icon: 'Layers',
    categories: ['Starter Deck'] 
  },
  { 
    id: 'promos', 
    label: { es: 'Promos', en: 'Promos' }, 
    icon: 'Star',
    categories: ['Promos'] 
  },
  { 
    id: 'store-events', 
    label: { es: 'Store Events', en: 'Store Events' }, 
    icon: 'Store',
    categories: ['Store Events'] 
  },
  { 
    id: 'championship', 
    label: { es: 'Championship', en: 'Championship' }, 
    icon: 'Trophy',
    categories: ['Championship'] 
  },
  { 
    id: 'energy-markers', 
    label: { es: 'Energy Markers', en: 'Energy Markers' }, 
    icon: 'Zap',
    categories: ['Energy Markers'],
    locked: false
  },
  { 
    id: 'coleccionismo', 
    label: { es: 'Coleccionismo', en: 'Collectibles' }, 
    icon: 'Diamond',
    categories: ['Coleccionismo'],
    locked: false
  },
];

const FUSION_EXPANSION_GROUPS: ExpansionGroup[] = [
  {
    category: 'Booster Box',
    items: [
      { id: 'FB01', label: 'FB01: Awakened Pulse', sub: 'Main Set', locked: false },
      { id: 'FB02', label: 'FB02: Blazing Aura', sub: 'Main Set', locked: false },
      { id: 'FB03', label: 'FB03: Raging Roar', sub: 'Main Set', locked: false },
      { id: 'FB04', label: 'FB04: Ultra Limit', sub: 'Main Set', locked: false },
      { id: 'FB05', label: 'FB05: New Adventure', sub: 'Main Set', locked: false },
      { id: 'FB06', label: 'FB06: Rivals Clash', sub: 'Main Set', locked: false },
      { id: 'FB07', label: 'FB07: WISH FOR SHENRON', sub: 'Main Set', locked: false },
      { id: 'FB08', label: 'FB08: SAIYAN’S PRIDE', sub: 'Main Set', locked: false },
      { id: 'FB09', label: 'FB09: DUAL EVOLUTION', sub: 'Main Set', locked: false },
      { id: 'FB10', label: 'FB10: CROSS FORCE (Próximamente)', sub: 'Main Set', locked: true },
      { id: 'FB11', label: 'FB11: BRIGHTNESS OF HOPE (Próximamente)', sub: 'Main Set', locked: true },
      { id: 'SB01', label: 'SB01: Manga booster 01', sub: 'Special Set', locked: false },
      { id: 'SB02', label: 'SB02: Manga booster 02', sub: 'Special Set', locked: false },
      { id: 'ST01', label: 'ST01: STORY BOOSTER 01 (Próximamente)', sub: 'Special Set', locked: true },
    ]
  },
  {
    category: 'Starter Deck',
    items: [
      { id: 'FS01', label: 'FS01: Son Goku', sub: 'Starter Deck', locked: false },
      { id: 'FS02', label: 'FS02: Vegeta', sub: 'Starter Deck', locked: false },
      { id: 'FS03', label: 'FS03: Broly', sub: 'Starter Deck', locked: false },
      { id: 'FS04', label: 'FS04: Frieza', sub: 'Starter Deck', locked: false },
      { id: 'FS05', label: 'FS05: Bardock', sub: 'Starter Deck', locked: false },
      { id: 'FS06', label: 'FS06: Son Goku (Mini)', sub: 'Starter Deck', locked: false },
      { id: 'FS07', label: 'FS07: Vegeta (Mini)', sub: 'Starter Deck', locked: false },
      { id: 'FS08', label: 'FS08: Vegeta (Mini) Super Saiyan 3', sub: 'Starter Deck', locked: false },
      { id: 'FS09', label: 'FS09: EX Shallot', sub: 'Starter Deck', locked: false },
      { id: 'FS10', label: 'EX Giblet', sub: 'Starter Deck', locked: false },
      { id: 'FS11', label: 'FS11: THE PHASE OF EVOLUTION', sub: 'Starter Deck', locked: false },
      { id: 'FS12', label: 'FS12: THE BEAT OF KI', sub: 'Starter Deck', locked: false },
    ]
  },
  {
    category: 'Promos',
    items: [
      { id: 'FP_FOLDER_MAIN', label: 'Promotion Cards', sub: 'Promos', locked: false, subItems: [
        { id: 'FP', label: 'All Promotion Cards', sub: 'Todas' },
        { id: 'FP_NY_COMIC_CON', label: 'New York Comic Con 2024', sub: 'Eventos' },
        { id: 'FP_CELEBRATION', label: 'Celebration Event', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB01', label: 'Release Event FB01', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB02', label: 'Release Event FB02', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB03', label: 'Release Event FB03', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB04', label: 'Release Event FB04', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB05', label: 'Release Event FB05', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB06', label: 'Release Event FB06', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB07', label: 'Release Event FB07', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB08', label: 'Release Event FB08', sub: 'Eventos' },
        { id: 'FP_RELEASE_FB09', label: 'Release Event FB09', sub: 'Eventos' }
      ] },
    ]
  },
  {
    category: 'Store Events',
    items: [
      {
        id: 'RE_FOLDER',
        label: 'Release Events',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { id: 'FP_RELEASE_FB01', label: 'Release Event FB01', sub: 'FB01' },
          { id: 'FP_RELEASE_FB02', label: 'Release Event FB02', sub: 'FB02' },
          { id: 'FP_RELEASE_FB03', label: 'Release Event FB03', sub: 'FB03' },
          { id: 'FP_RELEASE_FB04', label: 'Release Event FB04', sub: 'FB04' },
          { id: 'FP_RELEASE_FB05', label: 'Release Event FB05', sub: 'FB05' },
          { id: 'FP_RELEASE_FB06', label: 'Release Event FB06', sub: 'FB06' },
          { id: 'FP_RELEASE_FB07', label: 'Release Event FB07', sub: 'FB07' },
          { id: 'FP_RELEASE_FB08', label: 'Release Event FB08', sub: 'FB08' },
          { id: 'FP_RELEASE_FB09', label: 'Release Event FB09', sub: 'FB09' },
          { id: 'RE_SB01_FOLDER', label: 'Release Event SB01', sub: 'SB01' },
          { id: 'RE_SB02_FOLDER', label: 'Release Event SB02', sub: 'SB02' }
        ]
      },
      {
        id: 'TP_FOLDER_MAIN',
        label: 'Tournament Packs',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { 
            id: 'TP01_FOLDER', 
            label: 'Tournament Pack 01', 
            sub: 'TP01', 
            subItems: [
              { id: 'TP01_NORMAL_VIEW', label: 'Tournament Pack 01 (Normal)', sub: 'Normal' },
              { id: 'TP01_WINNER_VIEW', label: 'Tournament Pack 01 (Winner)', sub: 'Winner' }
            ]
          },
          { 
            id: 'TP02_FOLDER', 
            label: 'Tournament Pack 02', 
            sub: 'TP02',
            subItems: [
              { id: 'TP02_NORMAL_VIEW', label: 'Tournament Pack 02 (Normal)', sub: 'Normal' },
              { id: 'TP02_WINNER_VIEW', label: 'Tournament Pack 02 (Winner)', sub: 'Winner' }
            ]
          },
          { 
            id: 'TP03_FOLDER', 
            label: 'Tournament Pack 03', 
            sub: 'TP03',
            subItems: [
              { id: 'TP03_NORMAL_VIEW', label: 'Tournament Pack 03 (Normal)', sub: 'Normal' },
              { id: 'TP03_WINNER_VIEW', label: 'Tournament Pack 03 (Winner)', sub: 'Winner' }
            ]
          },
          { 
            id: 'TP04_FOLDER', 
            label: 'Tournament Pack 04', 
            sub: 'TP04',
            subItems: [
              { id: 'TP04_NORMAL_VIEW', label: 'Tournament Pack 04 (Normal)', sub: 'Normal' },
              { id: 'TP04_WINNER_VIEW', label: 'Tournament Pack 04 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP05_FOLDER',
            label: 'Tournament Pack 05',
            sub: 'TP05',
            subItems: [
              { id: 'TP05_NORMAL_VIEW', label: 'Tournament Pack 05 (Normal)', sub: 'Normal' },
              { id: 'TP05_WINNER_VIEW', label: 'Tournament Pack 05 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP06_FOLDER',
            label: 'Tournament Pack 06',
            sub: 'TP06',
            subItems: [
              { id: 'TP06_NORMAL_VIEW', label: 'Tournament Pack 06 (Normal)', sub: 'Normal' },
              { id: 'TP06_WINNER_VIEW', label: 'Tournament Pack 06 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP07_FOLDER',
            label: 'Tournament Pack 07',
            sub: 'TP07',
            subItems: [
              { id: 'TP07_NORMAL_VIEW', label: 'Tournament Pack 07 (Normal)', sub: 'Normal' },
              { id: 'TP07_WINNER_VIEW', label: 'Tournament Pack 07 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP08_FOLDER',
            label: 'Tournament Pack 08',
            sub: 'TP08',
            subItems: [
              { id: 'TP08_NORMAL_VIEW', label: 'Tournament Pack 08 (Normal)', sub: 'Normal' },
              { id: 'TP08_WINNER_VIEW', label: 'Tournament Pack 08 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP09_FOLDER',
            label: 'Tournament Pack 09',
            sub: 'TP09',
            subItems: [
              { id: 'TP09_NORMAL_VIEW', label: 'Tournament Pack 09 (Normal)', sub: 'Normal' },
              { id: 'TP09_WINNER_VIEW', label: 'Tournament Pack 09 (Winner)', sub: 'Winner' }
            ]
          },
          {
            id: 'TP10_FOLDER',
            label: 'Tournament Pack 10',
            sub: 'TP10',
            subItems: [
              { id: 'TP10_NORMAL_VIEW', label: 'Tournament Pack 10', sub: 'Normal' }
            ]
          }
        ]
      },
      {
        id: 'UB_FOLDER_MAIN',
        label: 'Ultimate Battle',
        sub: 'Eventos',
        locked: false,
        subItems: [
          {
            id: 'UB_2024_FOLDER',
            label: 'Ultimate Battle 2024',
            sub: '2024',
            subItems: [
              { id: 'UB24-1', label: 'Ultimate Battle 2024 VOL 1', sub: 'Vol.1' },
              { id: 'UB24-2', label: 'Ultimate Battle 2024 VOL 2', sub: 'Vol.2' },
              { id: 'UB24-3', label: 'Ultimate Battle 2024 VOL 3', sub: 'Vol.3' }
            ]
          },
          {
            id: 'UB_2025_FOLDER',
            label: 'Ultimate Battle 2025',
            sub: '2025',
            subItems: [
              { id: 'UB25-1', label: 'Ultimate Battle 2025 VOL 1', sub: 'Vol.1' },
              { id: 'UB25-2', label: 'Ultimate Battle 2025 VOL 2', sub: 'Vol.2' },
              { id: 'UB25-4', label: 'Ultimate Battle 2025 VOL 4', sub: 'Vol.4' },
              { id: 'UB25-5', label: 'Ultimate Battle 2025 VOL 5', sub: 'Vol.5' }
            ]
          },
          {
            id: 'UB_2026_FOLDER',
            label: 'Ultimate Battle 2026',
            sub: '2026',
            subItems: [
              { id: 'UB26-1', label: 'Ultimate Battle 2026 VOL 1', sub: 'Vol.1' },
              { id: 'UB26-2', label: 'Ultimate Battle 2026 VOL 2', sub: 'Vol.2' }
            ]
          }
        ]
      },
      {
        id: 'SPECIAL_EVENTS_FOLDER',
        label: 'Special Events',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { id: '1ST_ANNIV_FOLDER', label: '1st Anniversary Event', sub: 'Anniv' },
          { 
            id: '40TH_ANNIV_FOLDER_MAIN', 
            label: '40th Anniversary Event', 
            sub: 'Anniv',
            subItems: [
              { 
                id: '40TH_ANNIV_VOL1_FOLDER', 
                label: 'Vol. 1', 
                sub: 'Vol. 1',
                subItems: [
                  { id: '40TH_ANNIV_FOLDER', label: '40th Anniversary Event Vol.1', sub: 'Event' },
                  { id: 'LP01_FOLDER', label: 'Limited Pack Manga Version 01', sub: 'Manga' }
                ]
              },
              { 
                id: '40TH_ANNIV_VOL2_FOLDER', 
                label: 'Vol. 2', 
                sub: 'Vol. 2',
                subItems: [
                  { id: '40TH_ANNIV_V2', label: '40th Anniversary Event Vol.2', sub: 'Event' },
                  { id: 'LP02_FOLDER', label: 'Limited Pack Manga Version 02', sub: 'Manga' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'BCG_FEST_FOLDER',
        label: 'Bandai Card Games Fest',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { id: 'BCG_FEST_24', label: 'Bandai Card Games Fest 24', sub: '2024' },
          { id: 'BCG_FEST_25', label: 'Bandai Card Games Fest 25 (Próximamente)', sub: '2025', locked: true }
        ]
      }
    ]
  },
  {
    category: 'Championship',
    items: [
      { 
        id: 'CH2024_FOLDER', 
        label: 'Championship 2024', 
        sub: 'Championship', 
        locked: false,
        subItems: [
          {
            id: 'CH2024_W1_FOLDER',
            label: 'Championship 2024 Wave 1',
            sub: 'Wave 1',
            subItems: [
              { id: 'CP01_NORMAL_VIEW', label: 'Championship Pack 01 (Normal)', sub: 'Normal' },
              { id: 'CP01_ALT_VIEW', label: 'Championship Pack 01 (Alt)', sub: 'Alt' },
              { id: 'CP_W1', label: 'Top Cards', sub: 'Top' }
            ]
          },
          {
            id: 'CH2024_W2_FOLDER',
            label: 'Championship 2024 Wave 2',
            sub: 'Wave 2',
            subItems: [
              { id: 'CP02_NORMAL_VIEW', label: 'Championship Pack 02 (Normal)', sub: 'Normal' },
              { id: 'CP02_ALT_VIEW', label: 'Championship Pack 02 (Alt)', sub: 'Alt' },
              { id: 'CP_W2', label: 'Top Cards', sub: 'Top' }
            ]
          },
          {
            id: 'CH2024_FINALS_FOLDER',
            label: 'Championship 2024 Finals',
            sub: 'Finals',
            subItems: [
              { id: 'CP03_NORMAL_VIEW', label: 'Championship Pack 03 (Normal)', sub: 'Normal' },
              { id: 'CP03_ALT_VIEW', label: 'Championship Pack 03 (Alt)', sub: 'Alt' },
              { id: 'SP01_NORMAL_VIEW', label: 'Selection Pack 01 (Normal)', sub: 'Normal' },
              { id: 'SP01_ALT_VIEW', label: 'Selection Pack 01 (Alt)', sub: 'Alt' },
              { id: 'TR_FINALS_24', label: 'Finals 2024 Trophy Cards', sub: 'Trophy' }
            ]
          },
          { id: 'TR_GRAND_FINALS_24', label: 'Grand Finals 2024 Trophy Cards', sub: 'Grand Finals' }
        ]
      },
      { 
        id: 'CH2025_FOLDER', 
        label: 'Championship 2025', 
        sub: 'Championship', 
        locked: false,
        subItems: [
          {
            id: 'CH25_W1_FOLDER',
            label: 'Championship 2025 Wave 1',
            sub: 'Wave 1',
            subItems: [
              { id: 'LP25_01_NORMAL', label: 'Limited Pack Vol. 1 (Normal)', sub: 'Normal' },
              { id: 'LP25_01_WINNER', label: 'Limited Pack Vol. 1 (Winner)', sub: 'Winner' },
              { id: 'CP25_W1_TOP', label: 'Wave 1 Top Cards', sub: 'Top' },
              { id: 'ACC25_W1', label: 'Wave 1 Accessories', sub: 'Eventos' }
            ]
          },
          {
            id: 'CH25_W2_FOLDER',
            label: 'Championship 2025 Wave 2',
            sub: 'Wave 2',
            subItems: [
              { id: 'LP25_02_NORMAL', label: 'Limited Pack Vol. 2 (Normal)', sub: 'Normal' },
              { id: 'LP25_02_WINNER', label: 'Limited Pack Vol. 2 (Winner)', sub: 'Winner' },
              { id: 'CP25_W2_TOP', label: 'Wave 2 Top Cards', sub: 'Top' },
              { id: 'ACC25_W2', label: 'Wave 2 Accessories', sub: 'Eventos' }
            ]
          },
          {
            id: 'CH25_FINALS_FOLDER',
            label: 'Championship 2025 Finals',
            sub: 'Finals',
            subItems: [
              { id: 'CH25_FINALS_TOP', label: 'Finals Top Cards', sub: 'Top' },
              { id: 'CH25_FINALS_TROPHY', label: 'Finals Trophy Cards', sub: 'Trophy' },
              { id: 'CH25_FINALS_ACC', label: 'Finals Accessories', sub: 'Eventos' }
            ]
          },
          {
            id: 'CH25_GFINALS_FOLDER',
            label: 'Championship 2025 Grand Finals',
            sub: 'Grand Finals',
            subItems: [
              { id: 'CH25_GFINALS_TROPHY', label: 'Grand Finals Trophy Cards', sub: 'Trophy' },
              { id: 'CH25_GFINALS_ACC', label: 'Grand Finals Accessories', sub: 'Eventos' }
            ]
          }
        ]
      },
      {
        id: 'CH2026_FOLDER',
        label: 'Championship 2026',
        sub: 'Championship',
        locked: false,
        subItems: [
          {
            id: 'CH26_W1_FOLDER',
            label: 'Championship 2026 Wave 1',
            sub: 'Wave 1',
            subItems: [
              { id: 'LP26_W1_VIEW', label: 'Limited Pack 26/27 Wave 1', sub: 'Limited Pack' },
              { id: 'CH26_W1_TOP_VIEW', label: 'Wave 1 Top Cards', sub: 'Top' },
              { id: 'CH26_W1_ACC_VIEW', label: 'Wave 1 Accessories', sub: 'Playmat' }
            ]
          }
        ]
      }
    ]
  },
  {
    category: 'Coleccionismo',
    items: [
      {
        id: 'ANNIVERSARY_FOLDER',
        label: 'Anniversary Set',
        sub: 'Anniversary',
        locked: false,
        subItems: [
          { id: 'AS2025', label: '1st Anniversary Set', sub: 'Premium' },
          { id: 'AS2026', label: '2nd Anniversary Set', sub: 'Premium' },
        ]
      },
      {
        id: 'SLEEVES_FOLDER',
        label: 'Sleeves',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'SL-CH-W1', label: 'Championship 2024 Wave 1', sub: 'Eventos', locked: false },
          { id: 'SL-CH-W2', label: 'Championship 2024 Wave 2', sub: 'Eventos', locked: false },
          { id: 'SL-CH25-W1', label: 'Championship 2025 Wave 1 Sleeve', sub: 'Eventos', locked: false },
          { id: 'SL-CH25-W2', label: 'Championship 2025 Wave 2 Sleeve', sub: 'Eventos', locked: false },
          { id: 'SL01', label: 'OFFICIAL CARD SLEEVES 01', sub: 'Accessories', locked: false },
          { id: 'SL02', label: 'OFFICIAL CARD SLEEVES 02', sub: 'Accessories', locked: false },
          { id: 'SL03', label: 'OFFICIAL CARD SLEEVES 03', sub: 'Accessories', locked: false },
          { id: 'SL04', label: 'OFFICIAL CARD SLEEVES 04', sub: 'Accessories', locked: false },
          { id: 'SL-ILL', label: 'OFFICIAL CARD SLEEVES -ILLUSTRATIONS-', sub: 'Accessories', locked: false },
          { id: 'SL-ILL-SP', label: 'OFFICIAL CARD SLEEVES -ILLUSTRATIONS- Special', sub: 'Accessories', locked: false },
          { id: 'SL-LTD02-GOKU', label: 'Official Card Sleeves Limited Edition 02 - Son Goku Gold', sub: 'Accessories', locked: false },
          { id: 'SL-LTD02-SHENRON', label: 'Official Card Sleeves Limited Edition 02 - Shenron', sub: 'Accessories', locked: false },
          { id: 'SL-LTD03-BULMA', label: 'Official Card Sleeves Limited Edition 03 - Bulma', sub: 'Accessories', locked: false },
          { id: 'SL-LTD04-GOKU', label: 'Official Card Sleeves Limited Edition 04 - Son Goku', sub: 'Accessories', locked: false },
        ]
      },
      {
        id: 'PLAYMATS_FOLDER',
        label: 'Playmats',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'PM-CH-FINALS24', label: 'Finals 2024 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-GF24', label: 'Grand Finals 2024 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-W1', label: 'Championship 2024 Wave 1', sub: 'Eventos', locked: false },
          { id: 'PM-CH-W2', label: 'Championship 2024 Wave 2', sub: 'Eventos', locked: false },
          { id: 'PM-CH25-W1', label: 'Championship 2025 Wave 1 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH25-W2', label: 'Championship 2025 Wave 2 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-FINALS25', label: 'Finals 2025 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-GF25', label: 'Grand Finals 2025 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM01', label: 'OFFICIAL PLAYMAT & CARD SET Limited Edition 01', sub: 'Accessories', locked: false },
          { id: 'PM02', label: 'Official Playmat 40th Anniversary ver.', sub: 'Accessories', locked: false },
        ]
      },
      {
        id: 'PREMIUM_COLLECTION_FOLDER',
        label: 'Premium Card Collection',
        sub: 'Premium',
        locked: false,
        subItems: [
          { id: 'PCC01', label: 'Premium Card Collection Vol.1', sub: 'Premium', locked: false },
          { id: 'PCC02', label: 'Premium Card Collection Vol.2', sub: 'Premium', locked: false }
        ]
      },
      {
        id: 'CARD_CASE_FOLDER',
        label: 'Card Case',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'CC-BARDOCK', label: 'Official Card Case Sleeves Set 01 - Bardock', sub: 'Accessories', locked: false },
          { id: 'CC-VEGITO', label: 'Official Card Case Sleeves Set 02 - Vegito', sub: 'Accessories', locked: false },
          { id: 'CC-GOGETA', label: 'Official Card Case Sleeves Set 03 - Gogeta', sub: 'Accessories', locked: false },
          { id: 'CC-BROLY', label: 'Official Card Case Sleeves Set 04 - Broly', sub: 'Accessories', locked: false },
          { id: 'ACS01', label: 'OFFICIAL ACCESSORIES SET 01 - Son Goku vs Frieza', sub: 'Accessories', locked: false },
          { id: 'ACS02', label: 'OFFICIAL ACCESSORIES SET 02 - Vegito', sub: 'Accessories', locked: false },
        ]
      }
    ]
  }
];

import { energyMarkersData } from './data/energy_markers';
import { bt1Data } from './data/bt1';
import { promoData } from './data/promos';
import { startersData } from './data/starters';
import { expertsData } from './data/experts';
import { expansionsData } from './data/expansions';
import { tb3Data } from './data/tb3';
import { meritsData } from './data/merits';
import { tokensData } from './data/tokens';
import { tb2Data } from './data/tb2';
import { tb1Data } from './data/tb1';
import { eb1Data } from './data/eb1';
import { db3Data } from './data/db3';
import { db2Data } from './data/db2';
import { db1Data } from './data/db1';
import { bt2Data } from './data/bt2';
import { bt3Data } from './data/bt3';
import { bt4Data } from './data/bt4';
import { bt5Data } from './data/bt5';
import { bt6Data } from './data/bt6';
import { bt7Data } from './data/bt7';
import { bt8Data } from './data/bt8';
import { bt9Data } from './data/bt9';
import { bt10Data } from './data/bt10';
import { bt11Data } from './data/bt11';
import { bt12Data } from './data/bt12';
import { bt13Data } from './data/bt13';
import { bt14Data } from './data/bt14';
import { bt15Data } from './data/bt15';
import { bt16Data } from './data/bt16';
import { bt17Data } from './data/bt17';
import { bt18Data } from './data/bt18';
import { bt19Data } from './data/bt19';
import { bt20Data } from './data/bt20';
import { bt21Data } from './data/bt21';
import { bt22Data } from './data/bt22';
import { bt23Data } from './data/bt23';
import { bt24Data } from './data/bt24';
import { bt25Data } from './data/bt25';
import { bt26Data } from './data/bt26';
import { bt27Data } from './data/bt27';
import { bt28Data } from './data/bt28';
import { bt29Data } from './data/bt29';
import { bt30Data } from './data/bt30';
import { fusionWorldData } from './data/fusion_world';

// --- Types ---
const translations = {
  es: {
    home: 'Inicio',
    collection: 'Colección',
    stats: 'Estadísticas',
    profile: 'Perfil',
    welcome: '¡Bienvenido!',
    modeLabel: 'Preferencia de Colección',
    collector: 'Coleccionista',
    player: 'Jugador',
    collectorDesc: 'Objetivo de 1 unidad por carta.',
    playerDesc: 'Objetivo de playsets (4 copias).',
    searchPlaceholder: 'Buscar carta...',
    search: 'Buscar',
    recentAdded: 'Últimas añadidas',
    last7days: 'Últimos 7 días',
    exploreCollections: 'Explorar Colecciones',
    mostCompletedSet: 'Set más completo',
    completionProgress: 'Progreso de Colección',
    uniqueCards: 'Cartas Únicas',
    copies: 'Copias del Playset',
    totalTarget: 'Objetivo Total',
    distributionByType: 'Distribución por Tipo',
    distributionByRarity: 'Distribución por Rareza',
    topCollections: 'Top Colecciones',
    generalStats: 'Estadísticas Generales',
    colorProgress: 'Progreso por Color',
    raritiesFound: 'Rarezas Encontradas',
    alternatives: 'Versiones Alternativas',
    showAlternatives: 'Mostrar Alternativas',
    allAlternatives: 'Todas las alternativas',
    ownedFilter: 'Propiedad',
    allCards: 'Todas',
    onlyOwned: 'Tengo',
    onlyNotOwned: 'No tengo',
    language: 'Idioma',
    sendFeedback: 'Enviar Feedback',
    logout: 'Cerrar Sesión',
    donateTitle: 'Apoyar el proyecto',
    donateDesc: 'Ayúdame a mantener la app y añadir nuevas funciones',
    sponsorLabel: 'Patrocinador oficial',
    visitSponsor: 'Visitar montalfan.com',
    syncOfficial: 'Sincronizando con la web oficial...',
    thanksFeedback: '¡Gracias por tu feedback!',
    statusOk: 'Conectado',
    statusOffline: 'Desconectado',
    filters: 'Filtros y Orden',
    apply: 'APLICAR FILTROS',
    sortBy: 'Ordenar por',
    collectionNumber: 'Nº Colección',
    highestValue: 'Mayor Valor',
    nameAZ: 'Nombre A-Z',
    noCardsFound: 'No se encontraron cartas con estos filtros',
    clearFilters: 'Limpiar filtros',
    allCollections: 'Todas las Colecciones',
    seeAll: 'Ver todo el catálogo',
    flipCard: 'GIRAR CARTA (DESPERTAR)',
    quantity: 'Cantidad',
    currentSet: 'Set Actual',
    viewDetails: 'VER DETALLES',
    hideDetails: 'OCULTAR DETALLES',
    type: 'Tipo',
    banned: 'Baneada',
    bannedBO1: 'Baneada (BO1)',
    limited: 'Limitada',
    errata: 'Errateada',
    bannedSince: 'desde',
    includedInSet: 'Incluida en el set',
    obtainedIn: 'Se obtiene en',
    availableFrom: 'Disponible desde',
    legalStatusLabel: 'Estado Legal',
    changelog: 'Novedades',
    viewLatestChanges: 'Ver últimos cambios',
    changelogTitle: 'Últimas Actualizaciones',
    changelogSubtitle: 'Explora las mejoras técnicas recientes',
    close: 'Cerrar',
    color: 'Color',
    onboardingSub: '¿Cómo quieres gestionar tu colección de Dragon Ball Super?',
    changeCollection: 'Cambiar Colección',
    changeToGrid: 'Cambiar a Cuadrícula',
    changeToList: 'Cambiar a Lista',
    completed: 'Completado',
    remaining: 'Restante',
    cardNo: 'Nº Carta',
    cardsLabel: 'cartas',
    achievements: 'Logros',
    achievementUnlocked: '¡Logro Desbloqueado!',
    noAchievements: 'Aún no has conseguido ningún logro. ¡Sigue coleccionando!',
    unique: 'Único',
    tiered: 'Progreso',
    viewAchievement: 'Detalles del Logro',
    unlockedAt: 'Desbloqueado el',
    secretAchievement: 'Logro Secreto',
    secretAchievementDesc: 'Este logro es una sorpresa. ¡Sigue coleccionando para descubrirlo!',
    achievementStats: 'Estadísticas de Logros',
    visibleAchievements: 'Visibles',
    hiddenAchievements: 'Ocultos',
    totalAchievements: 'Total',
    sourceOrigin: 'Procedencia',
    viewOfficialErrata: 'Consultar Erratas Oficiales',
    viewOfficialBannedList: 'Ver lista oficial de baneos/limites',
    colorNames: {
      Red: 'Rojo',
      Blue: 'Azul',
      Green: 'Verde',
      Yellow: 'Amarillo',
      Black: 'Negro',
      Multi: 'Multicolor',
      White: 'Blanco'
    },
    typeNames: {
      Leader: 'Leader',
      Battle: 'Battle',
      Extra: 'Extra',
      'Energy Marker': 'Energy Marker',
      'Leader Rare': 'Leader Rare',
      'Marker': 'Energy Marker',
      'Accessory': 'Accesorio',
      'Token': 'Ficha'
    }
  },
  en: {
    home: 'Home',
    collection: 'Collection',
    stats: 'Statistics',
    profile: 'Profile',
    welcome: 'Welcome!',
    modeLabel: 'Collection Preference',
    collector: 'Collector',
    player: 'Player',
    collectorDesc: 'Objective of 1 unit per card.',
    playerDesc: 'Objective of playsets (4 copies).',
    searchPlaceholder: 'Search card...',
    search: 'Search',
    recentAdded: 'Recently added',
    last7days: 'Last 7 days',
    exploreCollections: 'Explore Collections',
    mostCompletedSet: 'Most completed set',
    completionProgress: 'Collection Progress',
    uniqueCards: 'Unique Cards',
    copies: 'Playset Copies',
    totalTarget: 'Total Target',
    distributionByType: 'Distribution by Type',
    distributionByRarity: 'Distribution by Rarity',
    topCollections: 'Top Collections',
    generalStats: 'General Statistics',
    colorProgress: 'Progress by Color',
    raritiesFound: 'Rarities Found',
    alternatives: 'Alternative Versions',
    showAlternatives: 'Show Alternatives',
    allAlternatives: 'All alternatives',
    ownedFilter: 'Ownership',
    allCards: 'All',
    onlyOwned: 'Owned',
    onlyNotOwned: 'Not Owned',
    language: 'Language',
    sendFeedback: 'Send Feedback',
    logout: 'Logout',
    donateTitle: 'Support the project',
    donateDesc: 'Help me maintain the app and add new features',
    sponsorLabel: 'Official sponsor',
    visitSponsor: 'Visit montalfan.com',
    syncOfficial: 'Syncing with official website...',
    thanksFeedback: 'Thanks for your feedback!',
    statusOk: 'Connected',
    statusOffline: 'Disconnected',
    filters: 'Filters & Order',
    apply: 'APPLY FILTERS',
    sortBy: 'Sort by',
    collectionNumber: 'Collection No.',
    highestValue: 'Highest Value',
    nameAZ: 'Name A-Z',
    noCardsFound: 'No cards found with these filters',
    clearFilters: 'Clear filters',
    allCollections: 'All Collections',
    seeAll: 'See all catalog',
    flipCard: 'FLIP CARD (AWAKEN)',
    quantity: 'Quantity',
    currentSet: 'Current Set',
    viewDetails: 'VIEW DETAILS',
    hideDetails: 'HIDE DETAILS',
    type: 'Type',
    banned: 'Banned',
    bannedBO1: 'Banned (BO1)',
    limited: 'Limited',
    errata: 'Errata',
    bannedSince: 'since',
    includedInSet: 'Included in set',
    obtainedIn: 'Obtained in',
    availableFrom: 'Available from',
    legalStatusLabel: 'Legal Status',
    changelog: 'Changelog',
    viewLatestChanges: 'View latest changes',
    changelogTitle: 'Latest Updates',
    changelogSubtitle: 'Explore recent technical improvements',
    close: 'Close',
    color: 'Color',
    onboardingSub: 'How do you want to manage your Dragon Ball Super collection?',
    changeCollection: 'Change Collection',
    changeToGrid: 'Change to Grid',
    changeToList: 'Change to List',
    completed: 'Completed',
    remaining: 'Remaining',
    cardNo: 'Card No.',
    cardsLabel: 'cards',
    achievements: 'Achievements',
    achievementUnlocked: 'Achievement Unlocked!',
    noAchievements: 'You haven\'t earned any achievements yet. Keep collecting!',
    unique: 'Unique',
    tiered: 'Ranked',
    viewAchievement: 'Achievement Details',
    unlockedAt: 'Unlocked on',
    secretAchievement: 'Secret Achievement',
    secretAchievementDesc: 'This achievement is a surprise. Keep collecting to discover it!',
    achievementStats: 'Achievement Statistics',
    visibleAchievements: 'Visible',
    hiddenAchievements: 'Hidden',
    totalAchievements: 'Total',
    sourceOrigin: 'Origin',
    viewOfficialErrata: 'View Official Erratas',
    viewOfficialBannedList: 'View official banned/limited list',
    colorNames: {
      Red: 'Red',
      Blue: 'Blue',
      Green: 'Green',
      Yellow: 'Yellow',
      Black: 'Black',
      Multi: 'Multicolor',
      White: 'White'
    },
    typeNames: {
      Leader: 'Leader',
      Battle: 'Battle',
      Extra: 'Extra',
      'Energy Marker': 'Energy Marker',
      'Leader Rare': 'Leader Rare',
      'Marker': 'Energy Marker',
      'Accessory': 'Accessory',
      'Token': 'Token'
    }
  }
};

interface ExpansionItem {
  id: string;
  label: string;
  sub: string;
  locked?: boolean;
  isSubItem?: boolean;
  isGiant?: boolean;
  subItems?: ExpansionItem[];
}

interface ExpansionGroup {
  category: string;
  items: ExpansionItem[];
}

interface Card {
  id: string;
  index: number;
  name: string;
  cardNumber: string;
  rarity: string;
  type: string;
  color: string;
  expansion: string;
  imageUrl: string;
  backImageUrl?: string;
  isFoil?: boolean;
  legalStatus?: 'Banned' | 'Limited' | 'Errata' | 'Banned (BO1)';
  legalDate?: string;
  sourceProduct?: string;
  releaseDate?: string;
  description?: string;
  sourceUrl?: string;
  traits?: string;
  skill?: string;
}

interface InventoryItem {
  id: string;
  cardId: string;
  quantity: number;
  ownerId: string;
  addedAt?: any;
}

interface UserAchievement {
  id: string;
  achievementId: string;
  ownerId: string;
  unlockedAt: any;
  currentProgress?: number;
  currentTier?: number;
  isSeen?: boolean;
}

interface AchievementDef {
  id: string;
  title: Record<'es' | 'en', string>;
  description: Record<'es' | 'en', string>;
  icon: string;
  type: 'unique' | 'tiered';
  category: string;
  subCategory?: string;
  hidden?: boolean;
  tiers?: { goal: number; title: Record<'es' | 'en', string> }[];
  check: (cards: Card[], inventory: InventoryItem[]) => { earned: boolean; progress?: number; tier?: number };
}

const SET_METADATA: Record<string, { sourceProduct: string; releaseDate?: string; description?: string; sourceUrl?: string }> = {
  'BT1': { sourceProduct: 'Galactic Battle', releaseDate: '28 de julio de 2017' },
  'BT2': { sourceProduct: 'Union Force', releaseDate: '3 de noviembre de 2017' },
  'BT3': { sourceProduct: 'Cross Worlds', releaseDate: '9 de marzo de 2018' },
  'BT4': { sourceProduct: 'Colossal Warfare', releaseDate: '13 de julio de 2018' },
  'BT5': { sourceProduct: 'Miraculous Revival', releaseDate: '9 de noviembre de 2018' },
  'BT6': { sourceProduct: 'Destroyer Kings', releaseDate: '15 de marzo de 2019' },
  'BT7': { sourceProduct: 'Assault of the Saiyans', releaseDate: '1 de agosto de 2019' },
  'BT8': { sourceProduct: 'Malicious Machinations', releaseDate: '22 de noviembre de 2019' },
  'BT9': { sourceProduct: 'Universal Onslaught', releaseDate: '14 de febrero de 2020' },
  'BT10': { sourceProduct: 'Rise of the Unison Warrior', releaseDate: '17 de julio de 2020' },
  'TB1': { sourceProduct: 'The Tournament of Power', releaseDate: '25 de mayo de 2018' },
  'TB2': { sourceProduct: 'World Martial Arts Tournament', releaseDate: '21 de septiembre de 2018' },
  'TB3': { sourceProduct: 'Clash of Fates', releaseDate: '1 de febrero de 2019' },
  'SD1': { sourceProduct: 'Starter Deck: The Awakening' },
  'SD2': { sourceProduct: 'Starter Deck: The Darkness' },
  'SD3': { sourceProduct: 'Starter Deck: The Guardian of Namekians' },
  'SD4': { sourceProduct: 'Starter Deck: The Resurrected Frieza' },
  'SD5': { sourceProduct: 'Starter Deck: The Crimson Saiyan' },
  'SD6': { sourceProduct: 'Starter Deck: Resurrected Fusion' },
  'SD7': { sourceProduct: 'Starter Deck: Shenron\'s Advent' },
  'SD8': { sourceProduct: 'Starter Deck: Rising Broly' },
  'SD9': { sourceProduct: 'Starter Deck: Saiyan Legacy' },
  'SD10': { sourceProduct: 'Starter Deck: Parasitic Overlord' },
  'SD11': { sourceProduct: 'Starter Deck: Instinct Surpassed' },
  'DB1': { sourceProduct: 'Draft Box 01' },
  'DB2': { sourceProduct: 'Draft Box 02' },
  'DB3': { sourceProduct: 'Draft Box 03' },
  'EB1': { sourceProduct: 'Battle Evolution Booster' },
  'ENM': { sourceProduct: 'Energy Markers' },
  'TP01': { sourceProduct: 'Tournament Pack 01' },
  'TP02': { sourceProduct: 'Tournament Pack 02' },
  'TP03': { sourceProduct: 'Tournament Pack 03' },
  'TP04': { sourceProduct: 'Tournament Pack 04' },
  'TP05': { sourceProduct: 'Tournament Pack 05' },
  'TP06': { sourceProduct: 'Tournament Pack 06' },
  'TP07': { sourceProduct: 'Tournament Pack 07' },
  'TP08': { sourceProduct: 'Tournament Pack 08' },
  'TP09': { sourceProduct: 'Tournament Pack 09' },
  'TP10': { sourceProduct: 'Tournament Pack 10' },
  'UB24-1': { sourceProduct: 'Ultimate Battle 2024 Vol.1' },
  'UB24-2': { sourceProduct: 'Ultimate Battle 2024 Vol.2' },
  'UB24-3': { sourceProduct: 'Ultimate Battle 2024 Vol.3' },
  'UB25-1': { sourceProduct: 'Ultimate Battle 2025 Vol.1' },
  'UB25-2': { sourceProduct: 'Ultimate Battle 2025 Vol.2' },
  'UB25-4': { sourceProduct: 'Ultimate Battle 2025 Vol.4' },
  'UB25-5': { sourceProduct: 'Ultimate Battle 2025 Vol.5' },
  'UB26-1': { sourceProduct: 'Ultimate Battle 2026 Vol.1' },
  'UB26-2': { sourceProduct: 'Ultimate Battle 2026 Vol.2' },
  'CH26_W1_FOLDER': { sourceProduct: 'Championship 2026 Wave 1' },
  'AS2026': { sourceProduct: '2nd Anniversary Set' },
  '40TH_ANNIV_V2': { sourceProduct: '40th Anniversary Vol.2' },
  '1ST_ANNIV_FOLDER': { sourceProduct: '1st Anniversary Event' },
  '40TH_ANNIV_FOLDER': { sourceProduct: '40th Anniversary Event' },
  'LP01_FOLDER': { sourceProduct: 'Limited Pack Manga Version 01' },
  'LP02_FOLDER': { sourceProduct: 'Limited Pack Manga Version 02' },
  'BCG_FEST_24': { sourceProduct: 'Bandai Card Games Fest 24' },
  'FP_RELEASE_FB01': { sourceProduct: 'Release Event FB01' },
  'FP_RELEASE_FB02': { sourceProduct: 'Release Event FB02' },
  'FP_RELEASE_FB03': { sourceProduct: 'Release Event FB03' },
  'FP_RELEASE_FB04': { sourceProduct: 'Winner Release Event FB04' },
  'FP_RELEASE_FB05': { sourceProduct: 'Release Event FB05' },
  'FP_RELEASE_FB06': { sourceProduct: 'Release Event FB06' },
  'FP_RELEASE_FB07': { sourceProduct: 'Release Event FB07' },
  'FP_RELEASE_FB08': { sourceProduct: 'Release Event FB08' },
  'FP_RELEASE_FB09': { sourceProduct: 'Release Event FB09' },
  'RE_SB01_FOLDER': { sourceProduct: 'Release Event SB01' },
  'RE_SB02_FOLDER': { sourceProduct: 'Release Event SB02' },
  'FP_CELEBRATION': { sourceProduct: 'Celebration Event' },
  'FP_NY_COMIC_CON': { sourceProduct: 'New York Comic Con 2024' },
  // Card Specific Metadata
  'FB03-011_BCGF': { 
    sourceProduct: 'Bandai Card Games Fest 24', 
    sourceUrl: 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/02/A3VziO6hMr6kTH4t/%E3%80%90FB03-011%E3%80%91Son%20Goku.png?_=',
    description: 'Carta promocional regalada a los asistentes del Bandai Card Games Fest 24.'
  },
  'FP-021_RE_FB03': { 
    sourceProduct: 'Release Event FB03',
    sourceUrl: 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/23/s2jWOEnr6cXsMuSo/EN_FW_FP-021_Battle_PR_TOP_dummy_s1.png?_=',
    description: 'Carta promocional del Release Event de la expansión FB03.'
  },
  'FP-008_RE_FB01': { 
    sourceProduct: 'Release Event FB01',
    sourceUrl: 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/mCVUo1ZouJsrdlrI/EN_FW_FP-008_Battle_PR_SP_dummy.png?_=',
    description: 'Carta promocional del Release Event de la expansión FB01.'
  },
  'FP-006_CE_G': {
    sourceProduct: 'Celebration Event',
    sourceUrl: 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/pQSFBcZBq2rYUgx1/EN_FW_FP-006_Battle_PR_SP_dummy.png?_=',
    description: 'Versión alternativa dorada de la carta promocional del Celebration Event.'
  },
  'FP-007_CE_G': {
    sourceProduct: 'Celebration Event',
    sourceUrl: 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/WOwpML1X5lM7LuhY/EN_FW_FP-007_Battle_PR_SP_dummy.png?_=',
    description: 'Versión alternativa dorada de la carta promocional del Celebration Event.'
  },
  'FP': { sourceProduct: 'Promotion Cards' },
  'AS2025': { sourceProduct: 'Anniversary Set 2025' },
};

const getDynamicPromoSource = (cardNumber: string): string | undefined => {
  if (!cardNumber.startsWith('P-')) return undefined;
  // User will provide official notes manually
  return undefined;
};

const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {
  // Fusion World FB02 Promos
  'FB01-066_A_FB02': { sourceProduct: 'FB02: Blazing Aura' },
  'FS01-15_A_FB02': { sourceProduct: 'FB02: Blazing Aura' },
  'FS03-15_A_FB02': { sourceProduct: 'FB02: Blazing Aura' },
  'FS04-16_A_FB02': { sourceProduct: 'FB02: Blazing Aura' },
  // Fusion World FB03 Promos
  'FB01-016_A_FB03': { sourceProduct: 'FB03: Raging Roar' },
  'FB01-049_A_FB03': { sourceProduct: 'FB03: Raging Roar' },
  'FS04-09_A_FB03': { sourceProduct: 'FB03: Raging Roar' },
  // Judge Packs
  'P-003_JP01': { sourceProduct: 'Judge Pack 01' }, 'P-015_JP01': { sourceProduct: 'Judge Pack 01' }, 'P-016_JP01': { sourceProduct: 'Judge Pack 01' }, 'P-018_JP01': { sourceProduct: 'Judge Pack 01' },
  'P-030_JP02': { sourceProduct: 'Judge Pack 02' }, 'P-032_JP02': { sourceProduct: 'Judge Pack 02' }, 'P-033_JP02': { sourceProduct: 'Judge Pack 02' }, 'P-036_JP02': { sourceProduct: 'Judge Pack 02' }, 'P-035_JP02': { sourceProduct: 'Judge Pack 02' },
  'P-053_JP03': { sourceProduct: 'Judge Pack 03' }, 'P-049_JP03': { sourceProduct: 'Judge Pack 03' }, 'P-040_JP03': { sourceProduct: 'Judge Pack 03' }, 'P-048_JP03': { sourceProduct: 'Judge Pack 03' }, 'P-052_JP03': { sourceProduct: 'Judge Pack 03' },
  'BT4-073_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT1-005_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT4-103_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT2-093_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT1-110_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT2-060_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT2-044_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT3-110_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT1-080_JP04': { sourceProduct: 'Judge Pack 04' }, 'BT2-010_JP04': { sourceProduct: 'Judge Pack 04' },
  'BT1-055_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT2-104_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT5-038_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT1-076_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT4-102_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT1-108_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT5-073_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT2-067_JP05': { sourceProduct: 'Judge Pack 05' }, 'BT5-075_JP05': { sourceProduct: 'Judge Pack 05' }, 'P-077_JP05': { sourceProduct: 'Judge Pack 05' },
  'BT5-115_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT5-109_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT6-107_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT5-101_JP06': { sourceProduct: 'Judge Pack 06' }, 'P-090_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT5-050_JP06': { sourceProduct: 'Judge Pack 06' }, 'TB3-048_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT6-026_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT6-025_JP06': { sourceProduct: 'Judge Pack 06' }, 'BT5-023_JP06': { sourceProduct: 'Judge Pack 06' },
  'EX3-08_JP07': { sourceProduct: 'Judge Pack 07' }, 'EX4-03_JP07': { sourceProduct: 'Judge Pack 07' }, 'P-112_JP07': { sourceProduct: 'Judge Pack 07' }, 'BT3-008_JP07': { sourceProduct: 'Judge Pack 07' }, 'BT1-025_JP07': { sourceProduct: 'Judge Pack 07' }, 'BT7-120_JP07': { sourceProduct: 'Judge Pack 07' }, 'TB2-024_JP07': { sourceProduct: 'Judge Pack 07' }, 'BT6-117_JP07': { sourceProduct: 'Judge Pack 07' }, 'BT7-117_JP07': { sourceProduct: 'Judge Pack 07' }, 'P-159_JP07': { sourceProduct: 'Judge Pack 07' },
  'BT7-106_JP08': { sourceProduct: 'Judge Pack 08' }, 'DB1-048_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT8-113_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT8-053_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT7-078_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT8-120_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT9-102_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT7-107_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT7-029_JP08': { sourceProduct: 'Judge Pack 08' }, 'BT9-123_JP08': { sourceProduct: 'Judge Pack 08' },
  'BT10-140_JP09': { sourceProduct: 'Judge Pack 09' }, 'DB1-020_JP09': { sourceProduct: 'Judge Pack 09' }, 'DB1-096_JP09': { sourceProduct: 'Judge Pack 09' }, 'BT6-013_JP09': { sourceProduct: 'Judge Pack 09' }, 'BT4-061_JP09': { sourceProduct: 'Judge Pack 09' }, 'BT3-120_JP09': { sourceProduct: 'Judge Pack 09' }, 'BT6-012_JP09': { sourceProduct: 'Judge Pack 09' }, 'TB1-044_JP09': { sourceProduct: 'Judge Pack 09' }, 'EX5-02_JP09': { sourceProduct: 'Judge Pack 09' }, 'TB3-025_JP09': { sourceProduct: 'Judge Pack 09' },
  'EX6-35_JP10': { sourceProduct: 'Judge Pack 10' }, 'P-241_JP10': { sourceProduct: 'Judge Pack 10' }, 'P-206_JP10': { sourceProduct: 'Judge Pack 10' }, 'DB2-143_JP10': { sourceProduct: 'Judge Pack 10' }, 'BT9-112_JP10': { sourceProduct: 'Judge Pack 10' }, 'DB1-101_JP10': { sourceProduct: 'Judge Pack 10' }, 'BT9-100_JP10': { sourceProduct: 'Judge Pack 10' }, 'BT10-064_JP10': { sourceProduct: 'Judge Pack 10' }, 'BT11-063_JP10': { sourceProduct: 'Judge Pack 10' }, 'DB3-015_JP10': { sourceProduct: 'Judge Pack 10' },
  'BT1-083_JP11': { sourceProduct: 'Judge Pack 11' }, 'BT13-034_JP11': { sourceProduct: 'Judge Pack 11' }, 'EB1-37_JP11': { sourceProduct: 'Judge Pack 11' }, 'BT5-103_JP11': { sourceProduct: 'Judge Pack 11' }, 'EB1-22_JP11': { sourceProduct: 'Judge Pack 11' }, 'EB1-11_JP11': { sourceProduct: 'Judge Pack 11' }, 'EB1-48_JP11': { sourceProduct: 'Judge Pack 11' }, 'EX13-34_JP11': { sourceProduct: 'Judge Pack 11' }, 'BT10-147_JP11': { sourceProduct: 'Judge Pack 11' }, 'EX13-30_JP11': { sourceProduct: 'Judge Pack 11' },
  'BT13-073_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT15-128_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT14-082_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT13-137_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT10-055_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT16-030_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT16-124_JP12': { sourceProduct: 'Judge Pack 12' }, 'EB1-20_JP12': { sourceProduct: 'Judge Pack 12' }, 'BT11-127_JP12': { sourceProduct: 'Judge Pack 12' }, 'EX20-01_JP12': { sourceProduct: 'Judge Pack 12' },
  // Judge Pack 13
  'BT10-058_JP13': { sourceProduct: 'Judge Pack 13' }, 'BT17-059_JP13': { sourceProduct: 'Judge Pack 13' }, 'BT17-135_JP13': { sourceProduct: 'Judge Pack 13' }, 'DB1-064_JP13': { sourceProduct: 'Judge Pack 13' }, 'DB2-136_JP13': { sourceProduct: 'Judge Pack 13' }, 'DB3-059_JP13': { sourceProduct: 'Judge Pack 13' }, 'DB3-101_JP13': { sourceProduct: 'Judge Pack 13' }, 'EX6-02_JP13': { sourceProduct: 'Judge Pack 13' }, 'SD2-04_JP13': { sourceProduct: 'Judge Pack 13' }, 'SD8-04_JP13': { sourceProduct: 'Judge Pack 13' },
  // Judge Pack 14
  'BT1-043_JP14': { sourceProduct: 'Judge Pack 14' }, 'BT8-032_JP14': { sourceProduct: 'Judge Pack 14' }, 'BT9-109_JP14': { sourceProduct: 'Judge Pack 14' }, 'BT13-121_JP14': { sourceProduct: 'Judge Pack 14' }, 'BT18-005_JP14': { sourceProduct: 'Judge Pack 14' }, 'BT18-128_JP14': { sourceProduct: 'Judge Pack 14' }, 'DB3-077_JP14': { sourceProduct: 'Judge Pack 14' }, 'P-270_JP14': { sourceProduct: 'Judge Pack 14' }, 'P-402_JP14': { sourceProduct: 'Judge Pack 14' }, 'P-405_JP14': { sourceProduct: 'Judge Pack 14' },
  'BT19-055_JP15': { sourceProduct: 'Judge Pack 15' }, 'BT14-073_JP15': { sourceProduct: 'Judge Pack 15' }, 'EX21-16_JP15': { sourceProduct: 'Judge Pack 15' }, 'SD17-05_JP15': { sourceProduct: 'Judge Pack 15' }, 'BT9-002_JP15': { sourceProduct: 'Judge Pack 15' }, 'P-275_JP15': { sourceProduct: 'Judge Pack 15' }, 'P-292_JP15': { sourceProduct: 'Judge Pack 15' }, 'DB1-101_JP15': { sourceProduct: 'Judge Pack 15' }, 'BT13-142_JP15': { sourceProduct: 'Judge Pack 15' }, 'P-419_JP15': { sourceProduct: 'Judge Pack 15' },
  // Judge Pack 16
  'BT8-022_JP16': { sourceProduct: 'Judge Pack 16' }, 'BT10-088_JP16': { sourceProduct: 'Judge Pack 16' }, 'EX21-15_JP16': { sourceProduct: 'Judge Pack 16' }, 'BT13-020_JP16': { sourceProduct: 'Judge Pack 16' }, 'BT12-115_JP16': { sourceProduct: 'Judge Pack 16' }, 'BT21-051_JP16': { sourceProduct: 'Judge Pack 16' }, 'P-219_JP16': { sourceProduct: 'Judge Pack 16' }, 'P-159_JP16': { sourceProduct: 'Judge Pack 16' }, 'BT14-135_JP16': { sourceProduct: 'Judge Pack 16' }, 'P-321_JP16': { sourceProduct: 'Judge Pack 16' },
  // Judge Pack 17
  'EX19-24_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT13-073_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT25-052_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT10-090_JP17': { sourceProduct: 'Judge Pack 17' }, 'P-359_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT10-123_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT25-005_JP17': { sourceProduct: 'Judge Pack 17' }, 'P-453_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT11-053_JP17': { sourceProduct: 'Judge Pack 17' }, 'BT16-087_JP17': { sourceProduct: 'Judge Pack 17' },
  // Judge Pack 18
  'DB2-097_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT14-007_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT15-033_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT7-110_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT19-049_JP18': { sourceProduct: 'Judge Pack 18' }, 'P-643_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT24-113_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT15-063_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT7-087_JP18': { sourceProduct: 'Judge Pack 18' }, 'BT24-088_JP18': { sourceProduct: 'Judge Pack 18' },
  // Event Pack 09
  'BT12-004_EP09': { sourceProduct: 'Event Pack 09' },
  'BT16-012_EP09': { sourceProduct: 'Event Pack 09' },
  'BT11-103_EP09': { sourceProduct: 'Event Pack 09' },
  'DB3-115_EP09': { sourceProduct: 'Event Pack 09' },
  'BT9-132_EP09': { sourceProduct: 'Event Pack 09' },
  'BT13-137_EP09': { sourceProduct: 'Event Pack 09' },
  'P-220_EP09': { sourceProduct: 'Event Pack 09' },
  'P-288_EP09': { sourceProduct: 'Event Pack 09' },
  'P-331_EP09': { sourceProduct: 'Event Pack 09' },
  'EB1-35_EP09': { sourceProduct: 'Event Pack 09' },

  // Event Pack 04
  'BT5-008_EP04': { sourceProduct: 'Event Pack 04' },
  'BT5-041_EP04': { sourceProduct: 'Event Pack 04' },
  'BT5-061_EP04': { sourceProduct: 'Event Pack 04' },
  'BT5-088_EP04': { sourceProduct: 'Event Pack 04' },
  'BT5-119_EP04': { sourceProduct: 'Event Pack 04' },
  'BT6-110_EP04': { sourceProduct: 'Event Pack 04' },
  'BT6-114_EP04': { sourceProduct: 'Event Pack 04' },
  'BT7-111_EP04': { sourceProduct: 'Event Pack 04' },
  'P-105_EP04': { sourceProduct: 'Event Pack 04' },
  'EX3-08_EP04': { sourceProduct: 'Event Pack 04' },

  // Event Pack 05
  'BT1-027_EP05': { sourceProduct: 'Event Pack 05' },
  'BT3-017_EP05': { sourceProduct: 'Event Pack 05' },
  'BT3-113_EP05': { sourceProduct: 'Event Pack 05' },
  'BT5-108_EP05': { sourceProduct: 'Event Pack 05' },
  'BT6-057_EP05': { sourceProduct: 'Event Pack 05' },
  'BT8-115_EP05': { sourceProduct: 'Event Pack 05' },
  'TB2-011_EP05': { sourceProduct: 'Event Pack 05' },
  'TB2-067_EP05': { sourceProduct: 'Event Pack 05' },
  'TB3-065_EP05': { sourceProduct: 'Event Pack 05' },
  'BT7-103_EP05': { sourceProduct: 'Event Pack 05' },

  // Event Pack 06
  'TB3-009_EP06': { sourceProduct: 'Event Pack 06' },
  'BT9-018_EP06': { sourceProduct: 'Event Pack 06' },
  'BT9-037_EP06': { sourceProduct: 'Event Pack 06' },
  'BT9-039_EP06': { sourceProduct: 'Event Pack 06' },
  'DB1-040_EP06': { sourceProduct: 'Event Pack 06' },
  'BT2-060_EP06': { sourceProduct: 'Event Pack 06' },
  'DB1-064_EP06': { sourceProduct: 'Event Pack 06' },
  'BT5-070_EP06': { sourceProduct: 'Event Pack 06' },
  'BT7-100_EP06': { sourceProduct: 'Event Pack 06' },
  'BT9-114_EP06': { sourceProduct: 'Event Pack 06' },

  // Event Pack 07
  'DB2-042_EP07': { sourceProduct: 'Event Pack 07' },
  'SD8-05_EP07': { sourceProduct: 'Event Pack 07' },
  'DB2-119_EP07': { sourceProduct: 'Event Pack 07' },
  'BT10-126_EP07': { sourceProduct: 'Event Pack 07' },
  'DB1-038_EP07': { sourceProduct: 'Event Pack 07' },
  'DB2-127_EP07': { sourceProduct: 'Event Pack 07' },
  'P-248_EP07': { sourceProduct: 'Event Pack 07' },
  'DB2-146_EP07': { sourceProduct: 'Event Pack 07' },
  'DB1-052_EP07': { sourceProduct: 'Event Pack 07' },
  'SD8-04_EP07': { sourceProduct: 'Event Pack 07' },

  // Event Pack 08
  'BT10-044_EP08': { sourceProduct: 'Event Pack 08' },
  'TB3-047_EP08': { sourceProduct: 'Event Pack 08' },
  'BT10-105_EP08': { sourceProduct: 'Event Pack 08' },
  'BT10-145_EP08': { sourceProduct: 'Event Pack 08' },
  'DB2-160_EP08': { sourceProduct: 'Event Pack 08' },
  'P-219_EP08': { sourceProduct: 'Event Pack 08' },
  'P-261_EP08': { sourceProduct: 'Event Pack 08' },
  'P-263_EP08': { sourceProduct: 'Event Pack 08' },
  'P-274_EP08': { sourceProduct: 'Event Pack 08' },
  'BT10-088_EP08': { sourceProduct: 'Event Pack 08' },
  // Event Pack 10
  'BT14-007_EP10': { sourceProduct: 'Event Pack 10' },
  'DB3-055_EP10': { sourceProduct: 'Event Pack 10' },
  'BT14-063_EP10': { sourceProduct: 'Event Pack 10' },
  'BT9-102_EP10': { sourceProduct: 'Event Pack 10' },
  'BT14-122_EP10': { sourceProduct: 'Event Pack 10' },
  'BT14-135_EP10': { sourceProduct: 'Event Pack 10' },
  'EX6-27_EP10': { sourceProduct: 'Event Pack 10' },
  'P-333_EP10': { sourceProduct: 'Event Pack 10' },
  'EB1-62_EP10': { sourceProduct: 'Event Pack 10' },
  // Event Pack 11
  'BT13-130_EP11': { sourceProduct: 'Event Pack 11' },
  'EX11-07_EP11': { sourceProduct: 'Event Pack 11' },
  'DB2-092_EP11': { sourceProduct: 'Event Pack 11' },
  'DB3-040_EP11': { sourceProduct: 'Event Pack 11' },
  'DB3-013_EP11': { sourceProduct: 'Event Pack 11' },
  'BT8-033_EP11': { sourceProduct: 'Event Pack 11' },
  'DB2-156_EP11': { sourceProduct: 'Event Pack 11' },
  'BT14-097_EP11': { sourceProduct: 'Event Pack 11' },
  // Event Pack 12
  'DB1-003_EP12': { sourceProduct: 'Event Pack 12' },
  'BT14-005_EP12': { sourceProduct: 'Event Pack 12' },
  'SD11-02_EP12': { sourceProduct: 'Event Pack 12' },
  'BT11-035_EP12': { sourceProduct: 'Event Pack 12' },
  'DB1-036_EP12': { sourceProduct: 'Event Pack 12' },
  'BT16-045_EP12': { sourceProduct: 'Event Pack 12' },
  'BT21-058_EP12': { sourceProduct: 'Event Pack 12' },
  'BT21-077_EP12': { sourceProduct: 'Event Pack 12' },
  'DB3-089_EP12': { sourceProduct: 'Event Pack 12' },
  'DB3-093_EP12': { sourceProduct: 'Event Pack 12' },
  'DB2-097_EP12': { sourceProduct: 'Event Pack 12' },
  'EX13-14_EP12': { sourceProduct: 'Event Pack 12' },
  'BT13-146_EP12': { sourceProduct: 'Event Pack 12' },
  'DB2-165_EP12': { sourceProduct: 'Event Pack 12' },
  'DB2-174_EP12': { sourceProduct: 'Event Pack 12' },
  'EB1-55_EP12': { sourceProduct: 'Event Pack 12' },
  // Event Pack 13
  'DB3-101_EP13': { sourceProduct: 'Event Pack 13' },
  'BT9-110_EP13': { sourceProduct: 'Event Pack 13' },
  'BT10-090_EP13': { sourceProduct: 'Event Pack 13' },
  'TB3-029_EP13': { sourceProduct: 'Event Pack 13' },
  'EX13-04_EP13': { sourceProduct: 'Event Pack 13' },
  'BT23-063_EP13': { sourceProduct: 'Event Pack 13' },
  'BT8-031_EP13': { sourceProduct: 'Event Pack 13' },
  'BT8-074_EP13': { sourceProduct: 'Event Pack 13' },
  'BT8-015_EP13': { sourceProduct: 'Event Pack 13' },
  'BT8-051_EP13': { sourceProduct: 'Event Pack 13' },
  'BT18-006_EP13': { sourceProduct: 'Event Pack 13' },
  'BT18-144_EP13': { sourceProduct: 'Event Pack 13' },
  'BT22-136_EP13': { sourceProduct: 'Event Pack 13' },
  'BT18-086_EP13': { sourceProduct: 'Event Pack 13' },
  'BT22-134_EP13': { sourceProduct: 'Event Pack 13' },
  'BT23-108_EP13': { sourceProduct: 'Event Pack 13' },
  'BT5-112_EP13': { sourceProduct: 'Event Pack 13' },
  'EB1-13_EP15': { sourceProduct: 'Event Pack 15' },
  'BT5-108_EP13': { sourceProduct: 'Event Pack 13' },
  // Event Pack 14
  'DB2-129_EP14': { sourceProduct: 'Event Pack 14' },
  'BT14-060_EP14': { sourceProduct: 'Event Pack 14' },
  'BT19-036_EP14': { sourceProduct: 'Event Pack 14' },
  'P-383_EP14': { sourceProduct: 'Event Pack 14' },
  'XD01-10_EP14': { sourceProduct: 'Event Pack 14' },
  'BT13-082_EP14': { sourceProduct: 'Event Pack 14' },
  'BT18-143_EP14': { sourceProduct: 'Event Pack 14' },
  'BT11-132_EP14': { sourceProduct: 'Event Pack 14' },
  'SD18-02_EP14': { sourceProduct: 'Event Pack 14' },
  'BT18-069_EP14': { sourceProduct: 'Event Pack 14' },
  'BT16-140_EP14': { sourceProduct: 'Event Pack 14' },
  'P-159_EP14': { sourceProduct: 'Event Pack 14' },
  'SD17-02_EP14': { sourceProduct: 'Event Pack 14' },
  'BT16-018_EP14': { sourceProduct: 'Event Pack 14' },
  'BT16-069_EP14': { sourceProduct: 'Event Pack 14' },
  'BT16-092_EP14': { sourceProduct: 'Event Pack 14' },
  'BT16-125_EP14': { sourceProduct: 'Event Pack 14' },
  'SD14-05_EP14': { sourceProduct: 'Event Pack 14' },
  // Event Pack 15
  'BT13-151_EP15': { sourceProduct: 'Event Pack 15' },
  'BT8-065_EP15': { sourceProduct: 'Event Pack 15' },
  'BT10-077_EP15': { sourceProduct: 'Event Pack 15' },
  'BT16-091_EP15': { sourceProduct: 'Event Pack 15' },
  'BT10-030_EP15': { sourceProduct: 'Event Pack 15' },
  'BT9-023_EP15': { sourceProduct: 'Event Pack 15' },
  'EB1-63_EP15': { sourceProduct: 'Event Pack 15' },
  'BT10-010_EP15': { sourceProduct: 'Event Pack 15' },
  'P-113_EP15': { sourceProduct: 'Event Pack 15' },
  'DB3-059_EP15': { sourceProduct: 'Event Pack 15' },
  'BT20-121_EP15': { sourceProduct: 'Event Pack 15' },
  'BT15-073_EP15': { sourceProduct: 'Event Pack 15' },
  'P-191_EP15': { sourceProduct: 'Event Pack 15' },
  'P-262_EP15': { sourceProduct: 'Event Pack 15' },
  // Event Pack 16
  'BT3-027_EP16': { sourceProduct: 'Event Pack 16' },
  'BT21-052_EP16': { sourceProduct: 'Event Pack 16' },
  'P-403_EP16': { sourceProduct: 'Event Pack 16' },
  'EX6-30_EP16': { sourceProduct: 'Event Pack 16' },
  'BT5-073_EP16': { sourceProduct: 'Event Pack 16' },
  'BT17-004_EP16': { sourceProduct: 'Event Pack 16' },
  'P-455_EP16': { sourceProduct: 'Event Pack 16' },
  'BT10-123_EP16': { sourceProduct: 'Event Pack 16' },
  'BT12-113_EP16': { sourceProduct: 'Event Pack 16' },
  'BT10-062_EP16': { sourceProduct: 'Event Pack 16' },
  'EX19-12_EP16': { sourceProduct: 'Event Pack 16' },
  'BT13-137_EP16': { sourceProduct: 'Event Pack 16' },
  'P-405_EP16': { sourceProduct: 'Event Pack 16' },
  'TB1-023_EP16': { sourceProduct: 'Event Pack 16' },
  'BT13-098_EP16': { sourceProduct: 'Event Pack 16' },
  'EX6-36_EP16': { sourceProduct: 'Event Pack 16' },
  'BT12-128_EP16': { sourceProduct: 'Event Pack 16' },
  'EB1-20_EP16': { sourceProduct: 'Event Pack 16' },
  // Event Pack 17
  'BT24-133_EP17': { sourceProduct: 'Event Pack 17' },
  'BT17-134_EP17': { sourceProduct: 'Event Pack 17' },
  'BT4-107_EP17': { sourceProduct: 'Event Pack 17' },
  'DB3-136_EP17': { sourceProduct: 'Event Pack 17' },
  'BT25-083_EP17': { sourceProduct: 'Event Pack 17' },
  'P-082_EP17': { sourceProduct: 'Event Pack 17' },
  'DB3-012_EP17': { sourceProduct: 'Event Pack 17' },
  'BT12-108_EP17': { sourceProduct: 'Event Pack 17' },
  'BT7-073_EP17': { sourceProduct: 'Event Pack 17' },
  'BT25-140_EP17': { sourceProduct: 'Event Pack 17' },
  'BT22-127_EP17': { sourceProduct: 'Event Pack 17' },
  'BT22-112_EP17': { sourceProduct: 'Event Pack 17' },
  'BT21-062_EP17': { sourceProduct: 'Event Pack 17' },
  'BT25-130_EP17': { sourceProduct: 'Event Pack 17' },
  'BT24-063_EP17': { sourceProduct: 'Event Pack 17' },
  'BT20-011_EP17': { sourceProduct: 'Event Pack 17' },
  'BT25-009_EP17': { sourceProduct: 'Event Pack 17' },
  'BT25-107_EP17': { sourceProduct: 'Event Pack 17' },
  'P-005_PR': { sourceProduct: 'Anime Expo 2017 - Puzzle Hunt' },
  // Event Pack 18
  'BT27-048_EP18': { sourceProduct: 'Event Pack 18' },
  'SD23-04_EP18': { sourceProduct: 'Event Pack 18' },
  'BT27-019_EP18': { sourceProduct: 'Event Pack 18' },
  'BT10-055_EP18': { sourceProduct: 'Event Pack 18' },
  'BT14-083_EP18': { sourceProduct: 'Event Pack 18' },
  'BT11-050_EP18': { sourceProduct: 'Event Pack 18' },
  'DB2-029_EP18': { sourceProduct: 'Event Pack 18' },
  'P-537_EP18': { sourceProduct: 'Event Pack 18' },
  'BT24-136_EP18': { sourceProduct: 'Event Pack 18' },
  'BT11-127_EP18': { sourceProduct: 'Event Pack 18' },
  'DB3-101_EP18': { sourceProduct: 'Event Pack 18' },
  'P-614_EP18': { sourceProduct: 'Event Pack 18' },
  'BT8-074_EP18': { sourceProduct: 'Event Pack 18' },
  'BT25-120_EP18': { sourceProduct: 'Event Pack 18' },
  'BT8-015_EP18': { sourceProduct: 'Event Pack 18' },
  'BT13-082_EP18': { sourceProduct: 'Event Pack 18' },
  'BT23-115_EP18': { sourceProduct: 'Event Pack 18' },
  'BT16-045_EP18': { sourceProduct: 'Event Pack 18' },
  'BT1-005_PR': { 
    sourceProduct: 'BCC Battles (Dec 2018) / National Finals 2018 (US/CA/OC/AS/EU)', 
    releaseDate: 'Diciembre de 2018' 
  },
  'BT1-005_PR02': { sourceProduct: 'US: National Championship Finals 2018' },
  'BT1-005_PR03': { sourceProduct: 'EXPANSION SET Magnificent Collection -Forsaken Warrior-' },
  'BT1-005_PR04': { sourceProduct: 'Special Anniversary Box 2021' },
  'BT1-010_PR': { sourceProduct: 'Winner - UNION FORCE Release Tournament' },
  'BT1-014_PR': { sourceProduct: 'Anniversary Box 2019' },
  'BT1-030_PR': { sourceProduct: 'Launch Kit' },
  'BT1-045_PR': { sourceProduct: 'Winner - UNION FORCE Release Tournament' },
  'BT1-069_PR': { sourceProduct: 'Winner - UNION FORCE Release Tournament' },
  'BT1-100_PR': { sourceProduct: 'Winner - UNION FORCE Release Tournament' },
  'BT2-022_PR': { sourceProduct: 'Winner - CROSS WORLDS Release Tournament' },
  'BT2-052_PR': { sourceProduct: 'Winner - CROSS WORLDS Release Tournament' },
  'BT2-083_PR': { sourceProduct: 'Winner - CROSS WORLDS Release Tournament' },
  'BT2-039_PR': { sourceProduct: 'Winner - MIRACULOUS REVIVAL Release Tournament' },
  'BT2-094_PR': { sourceProduct: 'Winner - MIRACULOUS REVIVAL Release Tournament' },
  'BT3-015_PR': { sourceProduct: 'Winner - MIRACULOUS REVIVAL Release Tournament' },
  'BT2-064_PR': { sourceProduct: 'Winner - DESTROYER KINGS Release Tournament' },
  'BT2-064_PR02': { sourceProduct: 'Mythic Booster' },
  'BT3-063_PR': { sourceProduct: 'Championship 2024 Finals Pack' },
  'BT3-063_PR02': { sourceProduct: 'Championship 2024 Finals EX Pack (Finalist ver.)' },
  'BT3-005_PR': { sourceProduct: 'Winner - COLOSSAL WARFARE Release Tournament' },
  'BT3-039_PR': { sourceProduct: 'Winner - COLOSSAL WARFARE Release Tournament' },
  'BT3-075_PR': { sourceProduct: 'Winner - COLOSSAL WARFARE Release Tournament' },
  'BT3-105_PR': { sourceProduct: 'Winner - COLOSSAL WARFARE Release Tournament' },
  'BT3-117_PR': { sourceProduct: 'Winner - COLOSSAL WARFARE Release Tournament' },
  'BT1-107_PR02': { sourceProduct: 'Winner - DESTROYER KINGS Release Tournament' },
  'BT1-052_EP03': { sourceProduct: 'Event Pack 03' },
  'BT1-052_PR02': { sourceProduct: 'Anniversary Box 2019' },
  'BT1-052_PR03': { sourceProduct: 'EXPANSION SET Magnificent Collection -Fusion Hero-' },
  'BT1-053_PR': { sourceProduct: 'Anniversary Box 2019' },
  'BT1-053_PR02': { sourceProduct: 'EXPANSION SET Magnificent Collection -Fusion Hero-' },
  'BT1-053_PR03': { sourceProduct: 'Mythic Booster' },
  'BT1-053_PR05': { sourceProduct: 'Championship Alt Art Card Set 2023 Vol.3' },
  'BT1-055_PR': { sourceProduct: 'Anniversary Box 2019' },
  'BT1-055_PR02': { sourceProduct: 'EXPANSION SET Magnificent Collection -Fusion Hero-' },
  'BT4-012_EP03': { sourceProduct: 'Event Pack 03' },
  'BT4-048_EP03': { sourceProduct: 'Event Pack 03' },
  'BT6-060_EP03': { sourceProduct: 'Event Pack 03' },
  'BT4-093_EP03': { sourceProduct: 'Event Pack 03' },
  'BT1-109_EP03': { sourceProduct: 'Event Pack 03' },
  'BT5-117_EP03': { sourceProduct: 'Event Pack 03' },
  'BT4-118_EP03': { sourceProduct: 'Event Pack 03' },
  'BT3-120_EP03': { sourceProduct: 'Event Pack 03' },
  'P-618_PR': { sourceProduct: 'Deluxe Pack 2024 Vol.2' },
  'P-619_PR': { sourceProduct: 'Deluxe Pack 2024 Vol.2' },
  'BT22-033_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.1' },
  'BT21-111_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.1' },
  'BT20-082_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.1' },
  'BT18-130_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.1' },
  'EX23-09_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.1' },
  'BT10-140_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.2' },
  'BT18-069_PR02': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.2' },
  'BT22-135_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.2' },
  'SD17-02_PR04': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.2' },
  'SD22-06_PR': { sourceProduct: 'Premium Alt-Art Card Set 2024 Vol.2' },
  'BT22-137_PR': { sourceProduct: 'TOP 16 Alt.Art card Vol.1' },
  'BT21-079_PR': { sourceProduct: 'TOP 16 Alt-Art card Vol.2' },
  'BT11-001_PR': { sourceProduct: 'Championship 2024 Golden Card Vol.1' },
  'BT24-055_PR02': { sourceProduct: 'Championship 2024 Golden Card Vol.2' },
  'BT1-111_PR02': { sourceProduct: 'Versión exclusiva de Europa' },
  'FB01-005_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-049_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-049_TP_W': { sourceProduct: 'Tournament Pack 01' },
  'FB01-057_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-087_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-087_TP_W': { sourceProduct: 'Tournament Pack 01' },
  'FB01-088_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-124_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-128_TP': { sourceProduct: 'Tournament Pack 01' },
  'FB01-128_TP_W': { sourceProduct: 'Tournament Pack 01' },
  'FS01-06_TP': { sourceProduct: 'Tournament Pack 01' },
  'FS01-06_TP_W': { sourceProduct: 'Tournament Pack 01' },
  'FB02-004_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-034_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-047_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-077_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-051_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-088_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-110_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-136_TP': { sourceProduct: 'Tournament Pack 02' },
  'FB02-034_TP_W': { sourceProduct: 'Tournament Pack 02' },
  'FB02-051_TP_W': { sourceProduct: 'Tournament Pack 02' },
  'FB02-077_TP_W': { sourceProduct: 'Tournament Pack 02' },
  'FB02-136_TP_W': { sourceProduct: 'Tournament Pack 02' },
  'FB01-096_UB_W': { sourceProduct: 'Ultimate Battle 2024 VOL 1' },
  'FS04-12_UB_T8': { sourceProduct: 'Ultimate Battle 2024 VOL 1' },
  'FB01-004_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB02-018_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB04-033_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FS02-15_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB01-078_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FS03-16_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB02-119_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FS04-11_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB03-125_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB04-104_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB01-007_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FS02-10_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB04-068_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB05-074_AS': { sourceProduct: 'Anniversary Set 2025' },
  'FB03-127_AS': { sourceProduct: 'Anniversary Set 2025' },
  'CP01': { sourceProduct: 'Championship Pack 01' },
  'FB01-005_CP': { sourceProduct: 'Championship Pack 01' },
  'FB01-005_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-033_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-033_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-039_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-039_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-042_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-042_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-085_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-085_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-086_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-086_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-132_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-132_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB02-137_CP': { sourceProduct: 'Championship Pack 01' },
  'FB02-137_CP_A': { sourceProduct: 'Championship Pack 01' },
  'FB01-139_AA': { sourceProduct: 'Booster Box FB01' },
  'FB02-139_AA': { sourceProduct: 'Booster Box FB02' },
  'FB03-140_AA': { sourceProduct: 'Booster Box FB03' },
  'FB04-129_AA': { sourceProduct: 'Booster Box FB04' },
  'FB05-119_AA': { sourceProduct: 'Booster Box FB05' },
  'FB05-120_AA': { sourceProduct: 'Booster Box FB05' },
  'FB05-119_RE': { sourceProduct: 'Championship Pack 01' },
  'FB02-133_RE': { sourceProduct: 'Championship 2024 Wave 1' },
  'FB01-015_RE': { sourceProduct: 'Championship 2024 Wave 1' },
  'FP-001_SE': { sourceProduct: 'Serial Collection Wave 1' },
  'FP-013_W_G': { sourceProduct: 'Winner Release Event FB02' },
  'TP02_NORMAL_VIEW': { sourceProduct: 'Tournament Pack 02' },
  'TP02_WINNER_VIEW': { sourceProduct: 'Tournament Pack 02' },
  'TP03_NORMAL_VIEW': { sourceProduct: 'Tournament Pack 03' },
  'TP03_WINNER_VIEW': { sourceProduct: 'Tournament Pack 03' },
  'TP04_NORMAL_VIEW': { sourceProduct: 'Tournament Pack 04' },
  'TP04_WINNER_VIEW': { sourceProduct: 'Tournament Pack 04' },
  'TP05_NORMAL_VIEW': { sourceProduct: 'Tournament Pack 05' },
  'TP05_WINNER_VIEW': { sourceProduct: 'Tournament Pack 05' },
  'TP06_NORMAL_VIEW': { sourceProduct: 'Tournament Pack 06' },
  'TP06_WINNER_VIEW': { sourceProduct: 'Tournament Pack 06' },
  
  // TP03 Cards Metadata
  'FB03-011_BCGF': { sourceProduct: 'Bandai Card Games Fest 2024' },
  'FB02-007_UB_V2_T8': { sourceProduct: 'Ultimate Battle 2024 VOL 2' },
  'FB02-061_UB_V2_W': { sourceProduct: 'Ultimate Battle 2024 VOL 2' },
  'FB03-014_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-032_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-052_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-061_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-073_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-081_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-122_TP': { sourceProduct: 'Tournament Pack 03' },
  'FB03-124_TP': { sourceProduct: 'Tournament Pack 03' },
  
  'FB03-032_TP_W': { sourceProduct: 'Tournament Pack 03' },
  'FB03-061_TP_W': { sourceProduct: 'Tournament Pack 03' },
  'FB03-081_TP_W': { sourceProduct: 'Tournament Pack 03' },
  'FB03-124_TP_W': { sourceProduct: 'Tournament Pack 03' },
  'FB03-022_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-024_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-024_TP_W': { sourceProduct: 'Tournament Pack 04' },
  'FB03-050_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-050_TP_W': { sourceProduct: 'Tournament Pack 04' },
  'FB03-057_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-086_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-086_TP_W': { sourceProduct: 'Tournament Pack 04' },
  'FB03-101_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-114_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-114_TP_W': { sourceProduct: 'Tournament Pack 04' },
  'FB03-132_TP': { sourceProduct: 'Tournament Pack 04' },
  'FB03-093_UB_V3_T8': { sourceProduct: 'Ultimate Battle 2024 VOL 3' },
  'FS03-10_UB_V3_W': { sourceProduct: 'Ultimate Battle 2024 VOL 3' },
  'FP-027_RE_FB04_W': { sourceProduct: 'Winner Release Event FB04' },
  'FS06-01_CE_G': { sourceProduct: 'Celebration Event' },
  'FS07-01_CE_G': { sourceProduct: 'Celebration Event' },
  'SL-CH-W1': { sourceProduct: 'Championship 2024 Wave 1' },
  'PM-CH-W1': { sourceProduct: 'Championship 2024 Wave 1' },
};

const IMAGE_OVERRIDES: Record<string, string> = {
  'FS01-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_f_p1.webp',
  'FS01-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-01_b_p1.webp',
  'FS02-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_f_p1.webp',
  'FS02-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-01_b_p1.webp',
  'FS03-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_f_p1.webp',
  'FS03-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-01_b_p1.webp',
  'FS04-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_f_p1.webp',
  'FS04-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-01_b_p1.webp',
  'FS05-01_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_f_p1.webp',
  'FS05-01_P1_b': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-01_b_p1.webp',
  'FB02-119_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-119_p3.webp?v1',
  'FB04-012_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-012_p3.webp?v1',
  'FB06-036_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-036_p1.webp?v1',
  'FB06-062_P1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-062_p1.webp?v1',
  'FB06-097_P3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-097_p3.webp?v1',
  'FB02-004_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-004_p1.webp?v1',
  'FB02-034_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-034_p1.webp?v1',
  'FB02-047_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-047_p1.webp?v1',
  'FB02-077_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-077_p1.webp?v1',
  'FB02-051_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-051_p1.webp?v1',
  'FB02-088_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-088_p1.webp?v1',
  'FB02-110_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-110_p1.webp?v1',
  'FB02-136_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-136_p1.webp?v1',
  'FB02-034_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-034_p2.webp?v1',
  'FB02-051_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-051_p2.webp?v1',
  'FB02-077_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-077_p2.webp?v1',
  'FB02-136_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-136_p2.webp?v1',
  'FB01-096_UB_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/05/15/ymjpMgIsvOoUsSOS/EN_FW_FB01-096_Battle_SR_RE_dummy_s1.png?_=',
  'FS04-12_UB_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/05/15/9zC4646wZSjdpvDA/EN_FW_FS04-12_Battle_C_RE_dummy_s1.png?_=',
  'FP-013_W_G': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/04/8P0aQpnjfBGqkFix/FP-013-Son-Gohan-Adolescence%E3%80%80Gold.png?_=',
  'CP03_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/x1JlIbQCaRDVlTYE/ChampionshipPack_03_dummy.png?_=',
  'CP03_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/x1JlIbQCaRDVlTYE/ChampionshipPack_03_dummy.png?_=',
  'CP03_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/QkXmqcQ9e1m9izLV/ChampionshipPack_03_FINALIST_dummy.png?_=',
  'SP01_FOLDER': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/3Be5453plg5PYCUV/SelectionPack_01_dummy.png?_=',
  'SP01_NORMAL_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/3Be5453plg5PYCUV/SelectionPack_01_dummy.png?_=',
  'SP01_ALT_VIEW': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/c7luXuU0RJh2VOID/SelectionPack_01_FINALIST_dummy.png?_=',
  'PM-CH-FINALS24': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/11/jkPK5Db2R8Mc3OeJ/FW_FINALS_PlayMat_dummy_s.png?_=',
  'PM-CH-GF24': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/O12MLkTmtVACXaht/FW_GRANDFINALS_PlayMat_dummy_s1.png?_=',
  'FB02-007_UB_V2_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/21/JYhlFKokuS4Q89Kc/EN_FW_FB02-007_Battle_R_RE_dummy_s1.png?_=',
  'FB02-061_UB_V2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/21/CXb3Zfj5xVmvlkeq/EN_FW_FB02-061_Battle_SR_RE_dummy_s1.png?_=',
  'FB03-011_BCGF': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/02/A3VziO6hMr6kTH4t/%E3%80%90FB03-011%E3%80%91Son%20Goku.png?_=',
  'FP-021_RE_FB03': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/23/s2jWOEnr6cXsMuSo/EN_FW_FP-021_Battle_PR_TOP_dummy_s1.png?_=',
  'FP-008_RE_FB01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/mCVUo1ZouJsrdlrI/EN_FW_FP-008_Battle_PR_SP_dummy.png?_=',
  'FP-006_CE_G': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/pQSFBcZBq2rYUgx1/EN_FW_FP-006_Battle_PR_SP_dummy.png?_=',
  'FP-007_CE_G': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2023/12/14/WOwpML1X5lM7LuhY/EN_FW_FP-007_Battle_PR_SP_dummy.png?_=',
  'FB03-014_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-014_p1.webp?v1',
  'FB03-032_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-032_p1.webp?v1',
  'FB03-052_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-052_p1.webp?v1',
  'FB03-061_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-061_p1.webp?v1',
  'FB03-073_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-073_p1.webp?v1',
  'FB03-081_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-081_p1.webp?v1',
  'FB03-122_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-122_p1.webp?v1',
  'FB03-124_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-124_p1.webp?v1',
  'FB03-032_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-032_p2.webp?v1',
  'FB03-061_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-061_p2.webp?v1',
  'FB03-081_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-081_p2.webp?v1',
  'FB03-124_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-124_p2.webp?v1',
  'FB01-004_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-004_p1.webp?v1',
  'FB02-012_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-012_p1.webp?v1',
  'FB02-049_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-049_p1.webp?v1',
  'FB02-116_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-116_p1.webp?v1',
  'FB03-028_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-028_p1.webp?v1',
  'FB03-127_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-127_p1.webp?v1',
  'FS03-13_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-13_p1.webp?v1',
  'FS03-16_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-16_p2.webp?v1',
  'FS04-11_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-11_p1.webp?v1',
  'FS05-15_CP3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-15_p2.webp?v1',
  'FB01-004_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-004_p2.webp?v1',
  'FB02-012_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-012_p2.webp?v1',
  'FB02-049_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-049_p2.webp?v1',
  'FB02-116_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-116_p2.webp?v1',
  'FB03-028_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-028_p2.webp?v1',
  'FB03-127_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-127_p2.webp?v1',
  'FS03-13_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-13_p2.webp?v1',
  'FS03-16_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS03-16_p3.webp?v1',
  'FS04-11_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-11_p2.webp?v1',
  'FS05-15_CP3_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-15_p3.webp?v1',
  'FP-014_SP1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-014_p1.webp?v1',
  'FP-015_SP1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-015_p1.webp?v1',
  'FP-016_SP1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-016_p1.webp?v1',
  'FP-022_SP1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-022_p2.webp?v1',
  'FP-023_SP1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-023_p2.webp?v1',
  'FP-014_SP1_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-014_p2.webp?v1',
  'FP-015_SP1_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-015_p2.webp?v1',
  'FP-016_SP1_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-016_p2.webp?v1',
  'FP-022_SP1_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-022_p3.webp?v1',
  'FP-023_SP1_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-023_p3.webp?v1',
  'FP-022_NY24': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-022_p1.webp?v1',
  'FB01-129_TR1': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-129_p2.webp?v1',
  'FB01-129_TR2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-129_p3.webp?v1',
  'FB01-129_TR3': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-129_p4.webp?v1',
  'FP-034_TR1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/0X8hYNPOO9yEn5XD/EN_FW_FP-034_Battle_GF_trophy_1st_dummy%EF%BC%88%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E7%84%A1%E3%81%97%EF%BC%89.png?_=',
  'FP-034_TR2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/ZafGXNNEIuEKZ930/EN_FW_FP-034_Battle_GF_trophy_2nd_dummy%EF%BC%88%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E7%84%A1%E3%81%97%EF%BC%89.png?_=',
  'FP-034_TR3': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/11/01/eaPs5ZbxSqMmhwv4/EN_FW_FP-034_Battle_GF_trophy_3rd_dummy%EF%BC%88%E3%83%86%E3%82%AD%E3%82%B9%E3%83%88%E7%84%A1%E3%81%97%EF%BC%89.png?_=',
  'FB02-102_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-102_p1.webp?v1',
  'FB03-011_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-011_p1.webp?v1',
  'FB03-023_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-023_p1.webp?v1',
  'FB03-049_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-049_p1.webp?v1',
  'FB03-075_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-075_p1.webp?v1',
  'FB03-083_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-083_p1.webp?v1',
  'FB03-119_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-119_p1.webp?v1',
  'FS05-16_CP2': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-16_p2.webp?v1',
  'FB02-102_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-102_p2.webp?v1',
  'FB03-011_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-011_p2.webp?v1',
  'FB03-023_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-023_p2.webp?v1',
  'FB03-049_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-049_p2.webp?v1',
  'FB03-075_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-075_p2.webp?v1',
  'FB03-083_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-083_p2.webp?v1',
  'FB03-119_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-119_p2.webp?v1',
  'FS05-16_CP2_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-16_p2.webp?v1',
  'FB03-064_RE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/21/mvAKAMuUD6gcnjXv/EN_FW_FB03-064_Battle_SR_RE_dummy_sample.png?_=',
  'FS05-11_RE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/21/lJZAzs17oCIrUGS2/EN_FW_FS05-11_Battle_SR_RE_dummy_sample.png?_=',
  'SL-CH-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/Ju7bjBR2JTAyejO0/FW_CHAMPIONSHIP_sleeve_wave1_dummy_s.png?_=',
  'PM-CH-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/08/29/GPPbDeDEuZOTChL8/FW_CHAMPIONSHIP_595%C3%97340mm_dummy_S.png?_=',
  
  'FB03-022_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-022_p1.webp?v1',
  'FB03-024_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-024_p1.webp?v1',
  'FB03-050_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-050_p1.webp?v1',
  'FB03-057_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-057_p1.webp?v1',
  'FB03-086_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-086_p1.webp?v1',
  'FB03-101_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-101_p1.webp?v1',
  'FB03-114_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-114_p1.webp?v1',
  'FB03-132_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-132_p1.webp?v1',
  'FB03-024_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-024_p2.webp?v1',
  'FB03-050_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-050_p2.webp?v1',
  'FB03-086_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-086_p2.webp?v1',
  'FB03-114_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-114_p2.webp?v1',
  
  'FB04-004_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-004_p1.webp?v1',
  'FB04-006_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-006_p1.webp?v1',
  'FB04-046_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-046_p1.webp?v1',
  'FB04-057_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-057_p1.webp?v1',
  'FB04-069_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-069_p1.webp?v1',
  'FB04-091_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-091_p1.webp?v1',
  'FB04-117_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-117_p1.webp?v1',
  'FB04-119_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-119_p1.webp?v1',
  'FB04-046_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-046_p2.webp?v1',
  'FB04-117_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-117_p2.webp?v1',
  'FB04-069_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-069_p2.webp?v1',
  'FB04-091_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-091_p2.webp?v1',
  'FB05-007_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-007_p1.webp?v1',
  'FB05-039_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-039_p1.webp?v1',
  'FB05-048_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-048_p1.webp?v1',
  'FB05-053_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-053_p2.webp?v1',
  'FB05-071_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-071_p1.webp?v1',
  'FB05-086_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-086_p1.webp?v1',
  'FB05-106_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-106_p1.webp?v1',
  'FB05-116_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-116_p1.webp?v1',
  'FB05-039_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-039_p2.webp?v1',
  'FB05-053_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-053_p3.webp?v1',
  'FB05-086_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-086_p2.webp?v1',
  'FB05-116_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-116_p2.webp?v1',

  'FP-027_RE_FB04_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/cElfkJ4Rfp1L1qCI/EN_FW_FP-027_Battle_PR_TOP_dummy_s.png?_=',
  'FS06-01_CE_G': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/5JwlksIxwvyOznq1/EN_FW_FS06-01_Leader_F_Gold_dummy_s1.png?_=',
  'FS06-01_CE_G_b': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/7jkVe30qPyfoxNn8/EN_FW_FS06-01_Leader_B_Gold_dummy_s1.png?_=',
  'FS07-01_CE_G': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/a6TUzaYdxXT3IVD2/EN_FW_FS07-01_Leader_F_Gold_dummy_s1.png?_=',
  'FS07-01_CE_G_b': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/09/29/3GjjK4h2omrKie1F/EN_FW_FS07-01_Leader_B_Gold_dummy_s1.png?_=',
  'FB03-093_UB_V3_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/05/RwQVO2O1rmnAmx2K/EN_FW_FB03-093_Battle_SR_RE_dummy_s.png?_=',
  'FS03-10_UB_V3_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/05/isoG07U7cM9GxwOO/EN_FW_FS03-10_Battle_SR_RE_dummy_s.png?_=',

  'FP-037_1ST_ANNIV': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/ZwDuBiY034yWtUoC/EN_FW_FP-037_Battle_PR_dummy_s.png?_=',
  'FB05-053_1ST_ANNIV_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/WXPyXZacJEuCphta/EN_FW_FB05-053_Battle_RE_dummy_s.png?_=',
  'FP-049_RE_SB01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/12/nG0BNZXtCeMjhmhN/EN_FW_FP-049_Battle_PR_TOP_dummy_s.png?_=',
  'FB05-054_40TH_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/27/TIPQOgKxxPCNBnnu/%E3%80%90BEST8%E3%80%91EN_FW_FB05-054_Battle_SR_dummy_s.png?_=',
  'SB01-057_40TH_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/27/2ea50zIaAVQXj7oh/%E3%80%90WINNER%E3%80%91EN_FW_SB01-057_Battle_SR_dummy_s.png?_=',
  'FB02-063_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-063_p1.webp?v1',
  'FB04-072_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-072_p4.webp?v1',
  'FB05-031_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-031_p1.webp?v1',
  'FB05-099_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-099_p1.webp?v1',
  'FB06-029_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-029_p2.webp?v1',
  'FS04-11_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS04-11_p4.webp?v1',
  'SB01-053_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB01-053_p2.webp?v1',
  'FP-034_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-034_p2.webp?v1',
  'FP-045_LP01': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-045_p2.webp?v1',
  'FP-044': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-044.webp?v1',
  'FP-044_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-044_p1.webp?v1',
  'FP-045': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-045.webp?v1',
  'FP-045_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-045_p1.webp?v1',
  'FP-046': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-046.webp?v1',
  'FP-046_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-046_p1.webp?v1',
  'FP-047': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-047.webp?v1',
  'FP-047_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-047_p1.webp?v1',
  'FP-048': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-048.webp?v1',
  'FP-048_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-048_p1.webp?v1',
  'FP-052': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-052.webp?v1',
  'FP-052_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-052_p1.webp?v1',
  'FP-053': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-053.webp?v1',
  'FP-053_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-053_p1.webp?v1',
  'FP-054': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-054.webp?v1',
  'FP-054_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-054_p1.webp?v1',
  'FP-055': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-055.webp?v1',
  'FP-055_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-055_p1.webp?v1',
  'FP-056': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-056.webp?v1',
  'FP-056_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-056_p1.webp?v1',
  'FB02-029_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/wIqwg5O1ttSHGi1J/EN_FW_FB02-029_Battle_UC-PARA_dummy_s1.png?_=',
  'FB03-047_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/RNvkWMaxUh1jeiOL/EN_FW_FB03-047_Battle_R-PARA_dummy_s1.png?_=',
  'FB04-042_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/fPYouO7rHKtb6cg4/EN_FW_FB04-042_Battle_C-PARA_dummy_s1.png?_=',
  'FB04-060_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/OjeC3tJBsy5GUeof/EN_FW_FB04-060_Battle_UC-PARA_dummy_s1.png?_=',
  'FB04-076_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/jt3zpdVDdo1JqF9Q/EN_FW_FB04-076_Extra_R-PARA_dummy_s1.png?_=',
  'FB04-085_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/HxKMBPdfS8fYS8Bm/EN_FW_FB04-085_Battle_R-PARA_dummy_s1.png?_=',
  'FB04-095_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/oLurd8gVKFWGQhjj/EN_FW_FB04-095_Battle_R-PARA_dummy_s1.png?_=',
  'FB04-117_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/KV6ifF1ygAnAaTFm/EN_FW_FB04-117_Battle_UC-PARA_dummy_s1.png?_=',
  'FB04-123_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/Cauf4sgXsuV6qvfP/EN_FW_FB04-123_Battle_R-PARA_dummy_s1.png?_=',
  'FS01-16_LCP01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/30YuAL3cfm6RGJ5Z/EN_FW_FS01-16_Extra_C-PARA_dummy_s1.png?_=',
  'FB02-029_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/BmdGg9pOLCAJcnlw/EN_FW_FB02-029_Battle_UC-PARA_RARE_dummy_s1.png?_=',
  'FB03-047_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/1Hfo5T18OTbfUDZU/EN_FW_FB03-047_Battle_R-PARA_RARE_dummy_s1.png?_=',
  'FB04-042_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/JLoACmh5P7cVOzhv/EN_FW_FB04-042_Battle_C-PARA_RARE_dummy_s1.png?_=',
  'FB04-060_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/OrViK8rk7XIa2VWn/EN_FW_FB04-060_Battle_UC-PARA_RARE_dummy_s1.png?_=',
  'FB04-076_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/M0N9ErDk4OKmhqHC/EN_FW_FB04-076_Extra_R-PARA_RARE_dummy_s1.png?_=',
  'FB04-085_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/Jvvpb1CtRRThunpo/EN_FW_FB04-085_Battle_R-PARA_RARE_dummy_s1.png?_=',
  'FB04-095_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/scWL0kcpppG97VhW/EN_FW_FB04-095_Battle_R-PARA_RARE_dummy_s1.png?_=',
  'FB04-117_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/0OILHtgOsyqmThsa/EN_FW_FB04-117_Battle_UC-PARA_RARE_dummy_s1.png?_=',
  'FB04-123_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/NpIO5Hd5zxIjbA1W/EN_FW_FB04-123_Battle_R-PARA_RARE_dummy_s1.png?_=',
  'FS01-16_LCP01_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/qXo89ds9eRmS9Y87/EN_FW_FS01-16_Extra_C-PARA_RARE_dummy_s1.png?_=',
  'FB04-094_CP25_W1_T': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/ReK59w0AjEdDCeKK/EN_FW_FB04-094_Battle_SR_PARA_RE_dummy_s1.png?_=',
  'FB04-130_CP25_W1_T': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/1ZgkrMHur99gwJrA/EN_FW_FB04-130_Battle_SCR_PARA_RE_dummy_s1.png?_=',
  'FB04-012_SE_CP25': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/rdIw3ZPaf2klq6gF/EN_FW_FB04-012_Battle_SR_PARA_UB2025_dummy_s1.png?_=',
  'SL-CH25-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/MKimgAngwNNNmDeH/FW_Championship25_sleeve_dummy_s1.png?_=',
  'PM-CH25-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/01/29/1PB3zAVz9yRiuEEd/FW_Championship_W_PlayMat_dummy_s5.png?_=',
  'FB03-123_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/jCh2vV8bWW3NIAqF/EN_FW_FB03-123_Battle_UC_dummy_s1_R.png?_=',
  'FB05-076_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/Jy9Lm6MQ7yKAijJY/EN_FW_FB05-076_Battle_R_dummy_s1_R.png?_=',
  'FB06-013_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/qvzyDB3TLcIjfW5c/EN_FW_FB06-013_Battle_C_dummy_s1_R.png?_=',
  'FB06-044_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/GoibAAUq3eD6Lq3z/EN_FW_FB06-044_Extra_UC_dummy_s1_R.png?_=',
  'FB06-057_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/3iYCTeOzDyST1JdK/EN_FW_FB06-057_Battle_C_dummy_s1_R.png?_=',
  'SB01-013_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/4wBH1cENRe39eDxF/EN_FW_SB01-013_Battle_UC_dummy_s1_R.png?_=',
  'SB01-021_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/iYmb4SXKdYxHAdiJ/EN_FW_SB01-021_Extra_UC_dummy_s1_R.png?_=',
  'SB01-024_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/TvEVwvP2UGWAcnd4/EN_FW_SB01-024_Battle_UC_dummy_s1_R.png?_=',
  'SB01-034_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/gv2ySAhYYjOokwnh/EN_FW_SB01-034_Battle_R_dummy_s1_R.png?_=',
  'SB01-047_LCP02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/RjOyfasj1jCHIKfA/EN_FW_SB01-047_Battle_UC_dummy_s1_R.png?_=',
  'FB03-123_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/qjj1DNT0Hr8vfl8H/EN_FW_FB03-123_Battle_UC_PARA_dummy_s1_R.png?_=',
  'FB05-076_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/23ocu8euHJuoFfkX/EN_FW_FB05-076_Battle_R_PARA_dummy_s1_R.png?_=',
  'FB06-013_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/w9CYKmNnv8iqzbvq/EN_FW_FB06-013_Battle_C_PARA_dummy_s1_R.png?_=',
  'FB06-044_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/u73BmEFfB8O3n50E/EN_FW_FB06-044_Extra_UC_PARA_dummy_s1_R.png?_=',
  'FB06-057_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/WTmOvzKWM9vclxIz/EN_FW_FB06-057_Battle_C_PARA_dummy_s1_R.png?_=',
  'SB01-013_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/JapQMOlVI9C6p1vz/EN_FW_SB01-013_Battle_UC_PARA_dummy_s1_R.png?_=',
  'SB01-021_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/uKb4UYmxwGieA309/EN_FW_SB01-021_Extra_UC_PARA_dummy_s1_R.png?_=',
  'SB01-024_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/d4pSoyVOk8EC7GB6/EN_FW_SB01-024_Battle_UC_PARA_dummy_s1_R.png?_=',
  'SB01-034_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/zx2p9pa8HHHgELi2/EN_FW_SB01-034_Battle_R_PARA_dummy_s1_R.png?_=',
  'SB01-047_LCP02_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/QTOHtPeTgMYtsUv7/EN_FW_SB01-047_Battle_UC_PARA_dummy_s1_R.png?_=',
  'SB01-012_CP25_W2_T': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/BrVypixviIelgtzW/EN_FW_SB01-012_Battle_SR_PARA_dummy_s_R.png?_=',
  'FB06-097_CP25_W2_T': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/DGij3Lo1sAKiPnKQ/EN_FW_FB06-097_Battle_SR_PARA_dummy_s_R.png?_=',
  'SL-CH25-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/SmQAsUNhl27cE9Ik/FW_Championship_wave2_sleeve_dummy_s_R.png?_=',
  'PM-CH25-W2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/13/o3Z7Cw0z0lJ2nu3f/FW_Championship_wave2_PlayMat_dummy_s1.png?_=',
  'FB04-114_UB_V1_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/E1hH6lkewXId8FXX/EN_FW_FB04-114_Battle_SR_PARA_RE_dummy_s1.png?_=',
  'FB03-121_UB_V1_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/ZqGXkFNX0GIzEIN5/EN_FW_FB03-121_UB_WINNER_dummy_s.png?_=',
  'FB01-089_UB_V1_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/BYh8dJUvwTUsgJnf/EN_FW_FB01-089_UB_WINNER_dummy_s.png?_=',
  'FS01-08_UB_V1_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/26/PfUcUruECPvQtknB/EN_FW_FS01-08_UB_WINNER_dummy_s.png?_=',
  'FB05-030_UB_V2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/04/10/ejld3cbA4wCft2YK/EN_FW_FB05-030_Battle_SR_PARA_RE_dummy_s1_R.png?_=',
  'FB05-080_UB_V2_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/04/10/b2fzdxDBZha4pSOv/EN_FW_FB05-080_Battle_SR_PARA_RE_dummy_s1_R.png?_=',
  'SB02-053_FNL25_128': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/e554zdXo1YgP2t9H/EN_FW_SB02-053_Battle_SR_PARA_dummy.webp',
  'FB06-063_FNL25_64': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/10/02/FaIoI3yEGRK3gdpK/EN_FW_FB06-063_Battle_SR_PARA_dummy.webp',
  'FB04-129_FNL25_32': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/EBjkoxmAdji5mbVZ/EN_FW_FB04-129_Battle_SCR_PARA_dummy_s.webp',
  'PM-CH-FINALS25': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/qVDWZ6fcyaG7nF8n/FW_25_26_FinalsTop16_PlayMat_dummy_s.png?_=',
  'FB07-121_FNL25_3RD': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/S8I0WkSCilDgQqpd/EN_FW_FB07-121_Battle_TOP3_trophy_3rd_dummy_s.webp',
  'FB07-121_FNL25_2ND': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/D8wmQa8JkY8aZye3/EN_FW_FB07-121_Battle_TOP3_trophy_2nd_dummy_s.webp',
  'FB07-121_FNL25_CHAMP': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/30/w0UGnedHMj3mQ4Uc/EN_FW_FB07-121_Battle_TOP3_trophy_Champion_dummy_s.webp',
  'PM-CH-GF25': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/10/29/noJQ4WvZ9gpAUyrj/FW_25_26_GrandFinals_PlayMat_dummy_s_low.webp',
  'FB07-122_GFNL25_3RD': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/10/29/5CG9S3Mtf3Qzu98n/EN_FW_FB07-122_Battle_TOP3_trophy_3rd_dummy.webp',
  'FB07-122_GFNL25_2ND': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/10/29/AnXsRXhNOiPQKR1g/EN_FW_FB07-122_Battle_TOP3_trophy_2nd_dummy.webp',
  'FB07-122_GFNL25_CHAMP': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/10/29/J9CjHAWSpJBWeV1H/EN_FW_FB07-122_Battle_TOP3_trophy_Champion_dummy.webp',
  'FP-034_RE_FB05': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/12/24/gDxNt1WK7NifAb2K/EN_FW_FP-034_Battle_PR_TOP_s1.png?_=',
  'FP-041_RE_FB06': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/04/03/DFeL2wYEZhLt5o9u/EN_FW_FP-041_Battle_PR_TOP_dummy_s1.png?_=',
  'FP-050_RE_FB07': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/08/06/KS43U87s7r2j4gCq/EN_FW_FP-050_Battle_PR_TOP_dummy.webp',
  'SB01-018_UB_V4_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/19/qy3rwuwoGF428EzQ/EN_FW_SB01-018_Battle_SR_PARA_dummy_s.png?_=',
  'FP-041_UB_V4_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/09/19/60HQ0wHZfWBide4h/EN_FW_FP-041_Battle_PR_PARA_dummy_s.png?_=',
  'FB08-024_UB_26_V1_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/12/08/7FZwrBs9ObFVlOaX/FB08-024_p1.webp',
  'FB07-035_UB_26_V1_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/12/08/EkTQphCDKtCXGaxM/FB07-035_p2.webp',
  'FP-075_AS2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/13/xgzcWeRBuk4gCxH9/EN_FW_FP-075_Battle_PR_dummy_s.png?_=',
  'FP-076_AS2': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/13/CFbs8ccTal8pJp5M/EN_FW_FP-076_Battle_PR_dummy_s.png?_=',
  'FP-079_AS2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/13/vrk1iEcacYc3G2ON/EN_FW_FP-079_Battle_UB_WINNER_dummy_s.png?_=',
  'FP-080_AS2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/13/vcIgaMLGn7V1IYOH/EN_FW_FP-080_Battle_UB_WINNER_dummy_s.png?_=',
  'FP-081_AS2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/13/RBZA303RApKlHjbl/EN_FW_FP-081_Battle_UB_WINNER_dummy_s.png?_=',
  'FB09-010_UB_26_V2_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/glxZReEtXiOoSfFW/TOP8_EN_FW_FB09-010_Battle_R_PARA_dummy_s.webp',
  'FS11-07_UB_26_V2_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/t1pniG0RhpJ3Ji1S/WINNER_EN_FW_FS11-07_Battle_SR_PARA_dummy_s.webp',
  'FP-077_RE_FB09': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/ho0JjheiREB9v30p/EN_FW_FP-077_Battle_PR_PARA_dummy_s.webp',
  'FB09-006_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/2Gqf5eVowva4C95a/EN_FW_FB09-006_Battle_R_PARA_dummy_s.webp',
  'FB09-008_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/SxhFuCyaGnqs6Z3A/EN_FW_FB09-008_Battle_C_PARA_dummy_s.webp',
  'FB09-009_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/XsSj4chJcT8xXPtA/EN_FW_FB09-009_Battle_UC_PARA_dummy_s.webp',
  'FB09-023_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/GJ0sFPIC1PbG9lOP/EN_FW_FB09-023_Extra_UC_PARA_dummy_s.webp',
  'FB09-033_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/w2NxBNjL5aFBSa9Q/EN_FW_FB09-033_Battle_C_PARA_dummy_s.webp',
  'FB09-038_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/M0I9XkoZrqRthOZ4/EN_FW_FB09-038_Battle_C_PARA_dummy_s.webp',
  'FB09-043_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/fMuChKoecR5luyjf/EN_FW_FB09-043_Battle_C_PARA_dummy_s.webp',
  'FB09-047_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/uUrpJrHJtt7It4kW/EN_FW_FB09-047_Extra_UC_PARA_dummy_s.webp',
  'FB09-052_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/c0jpb8qkEisEtXui/EN_FW_FB09-052_Battle_R_PARA_dummy_s.webp',
  'FB09-056_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/Obo05TbIpu91kbq6/EN_FW_FB09-056_Battle_C_PARA_dummy_s.webp',
  'FB09-058_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/VYPAo9zf8ac70kVx/EN_FW_FB09-058_Battle_UC_PARA_dummy_s.webp',
  'FB09-062_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/y84649IEtvYViHqI/EN_FW_FB09-062_Battle_C_PARA_dummy_s.webp',
  'FB09-074_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/j5VSNHYMFphUaaV8/EN_FW_FB09-074_Battle_C_PARA_dummy_s.webp',
  'FB09-080_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/2sFl7oy1R804GpCs/EN_FW_FB09-080_Battle_UC_PARA_dummy_s.webp',
  'FB09-092_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/8haOeyP8yFBJUqGL/EN_FW_FB09-092_Battle_UC_PARA_dummy_s.webp',
  'FB09-094_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/Xh2clyes1uR93KSh/EN_FW_FB09-094_Battle_C_PARA_dummy_s.webp',
  'FB09-113_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/uXfccgvH7CZxCMlg/EN_FW_FB09-113_Battle_C_PARA_dummy_s.webp',
  'FB09-116_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/FhquoE4nvaKVxvWR/EN_FW_FB09-116_Battle_R_PARA_dummy_s.webp',
  'FB09-118_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/FbWX2HmghJRPwKBJ/EN_FW_FB09-118_Battle_C_PARA_dummy_s.webp',
  'FB09-120_LP26_W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/09/CGzHpKpWYva2Kehs/EN_FW_FB09-120_Extra_R_PARA_dummy_s.webp',
  'FB09-060_CH26_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/10/MeNGe0fVW0YCGbJl/SR%20Gohan.png?_=',
  'FB09-037_CH26_T4': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/10/UzwLSAUlRxCxIjm4/SP%20Goku.png?_=',
  'FB09-007_CH26_SE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/10/Vry4aL0HeKyj2ijC/EN_FW_FB09-007_Battle_SR_PARA_SerialNumber_dummy_s%20no%20border.png?_=',
  'PM-CH26-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/03/10/ibHFtL8X0sH6OEs4/FW_Championship26_27_PlayMat_dummy_s_R.jpg?_=',
  'FP-070': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/C7vqlgiI7rit17gf/EN_FW_FP-070_Battle_PR_PARA_dummy.webp',
  'FP-071': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/TUMCErgfZyTXWE5v/EN_FW_FP-071_Battle_PR_PARA_dummy.webp',
  'FP-072': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/YuWrxObI4vU2WWdG/EN_FW_FP-072_Battle_PR_PARA_dummy.webp',
  'FP-073': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/6wGYWSmKcGuwPIqd/EN_FW_FP-073_Battle_PR_PARA_dummy.webp',
  'FP-074': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2026/02/26/0doeBkrWE9R31Jjm/EN_FW_FP-074_Battle_PR_PARA_dummy.webp',
  'FP-068_RE_FB08': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/18/yNcHySY9RGBu4kje/EN_FW_FP-068_Battle_PR_PARA_dummy.webp',
  'FP-063': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/USK9q1KTiy0nqJqF/EN_FW_FP-063_Battle_PR_dummy_s_R.webp',
  'FP-064': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/AfwiqQUDH6A6ccjx/EN_FW_FP-064_Battle_PR_dummy_s_R.webp',
  'FP-065': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/3fCuSDGLNTU5koTu/EN_FW_FP-065_Battle_PR_dummy_s_R.webp',
  'FP-066': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/gyjfFX9dQV3KnmWw/EN_FW_FP-066_Battle_PR_dummy_s_R.webp',
  'FP-067': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/eAFDs3DLadM1v1Dx/EN_FW_FP-067_Battle_PR_dummy_s_R.webp',
  'FP-063_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/WlLxNUITm0w0ogeX/EN_FW_FP-063_Battle_PR_PARA_dummy_s_R.webp',
  'FP-064_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/axu3hUF2Ufb3HVfM/EN_FW_FP-064_Battle_PR_PARA_dummy_s_R.webp',
  'FP-065_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/mLT0nD2UFHLYhi8h/EN_FW_FP-065_Battle_PR_PARA_dummy_s_R.webp',
  'FP-066_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/M7SiQaySD1oqAWRc/EN_FW_FP-066_Battle_PR_PARA_dummy_s_R.webp',
  'FP-067_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/28/OFgOk8LzPDTGbItU/EN_FW_FP-067_Battle_PR_PARA_dummy_s_R.webp',
  'FP-062_RE_SB02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/10/09/KAYBWoOt9tQnYVm0/EN_FW_FP-062_Battle_PR_TOP_dummy.webp',
  'SB02-007_40TH_W': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/10/21/SkGFemkzNWvjAV2m/EN_FW_SB02-007_Battle_UC_TOP_dummy_s.webp',
  'FB07-104_40TH_T8': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/10/21/7bLEKMf6KeQtKFdC/EN_FW_FB07-104_Battle_SR_BEST8_dummy_s.webp',
  'FB02-047_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-047_p3.webp?v1',
  'FB05-100_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-100_p2.webp?v1',
  'FS02-03_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS02-03_p2.webp?v1',
  'FS07-12_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS07-12_p1.webp?v1',
  'SB02-002_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB02-002_p1.webp?v1',
  'SB02-003_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB02-003_p1.webp?v1',
  'SB02-011_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB02-011_p1.webp?v1',
  'SB02-049_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB02-049_p1.webp?v1',
  'SB02-059_LP02': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/SB02-059_p1.webp?v1',
  'FB01-005_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-005_p1.webp?v1',
  'FB01-049_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-049_p1.webp?v1',
  'FB01-049_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-049_p2.webp?v1',
  'FB01-057_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-057_p1.webp?v1',
  'FB01-087_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-087_p1.webp?v1',
  'FB01-087_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-087_p2.webp?v1',
  'FB01-088_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-088_p1.webp?v1',
  'FB01-124_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-124_p1.webp?v1',
  'FB01-128_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-128_p1.webp?v1',
  'FB01-128_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-128_p2.webp?v1',
  'FS01-06_TP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-06_p1.webp?v1',
  'FS01-06_TP_W': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS01-06_p2.webp?v1',
  'FB01-004_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/lqSIpDdxT42CB77j/EN_FW_FB01-004_Battle_UC_PARA_dummy.webp',
  'FB02-018_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/cl9USd9umgLTELsM/EN_FW_FB02-018_Battle_SR_PARA_dummy.webp',
  'FB04-033_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/E8Mdf6cW77Zy8Hl8/EN_FW_FB04-033_Battle_SR_PARA_dummy.webp',
  'FS02-15_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/vTLhaQkhYyQZL6wU/EN_FW_FS02-15_Extra_C_PARA_dummy.webp',
  'FB01-078_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/zVnH17cJ584vmFmM/EN_FW_FB01-078_Battle_SR_PARA_dummy.webp',
  'FS03-16_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/EdgUH3ACmi7DqQsH/EN_FW_FS03-16_Extra_C_PARA_dummy.webp',
  'FB02-119_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/WWkei5NtR08kWTuX/EN_FW_FB02-119_Battle_SR_PARA_dummy.webp',
  'FS04-11_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/I8G8Sg7JDekSwWHi/EN_FW_FS04-11_Battle_C_PARA_dummy.webp',
  'FB03-125_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/MinCeQqNOsOKDmcT/EN_FW_FB03-125_Battle_SR_PARA_dummy.webp',
  'FB04-104_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/f9sCr873KqqohGQX/EN_FW_FB04-104_Battle_SR_PARA_dummy.webp',
  'FB01-007_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/NUeeJZjNS0oXxAax/EN_FW_FB01-007_Battle_UC_PARA_dummy.webp',
  'FS02-10_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/53aHmMpH9BoX1bWG/EN_FW_FS02-10_Battle_C_PARA_dummy.webp',
  'FB04-068_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/xJk5yTKpuc3FrvLX/EN_FW_FB04-068_Battle_UC_PARA_dummy.webp',
  'FB05-074_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/PO19rhwauxU9GO3x/EN_FW_FB05-074_Battle_UC_PARA_dummy.webp',
  'FB03-127_AS': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/06/yZQ0aLRbqOVFBSRm/EN_FW_FB03-127_Battle_UC_PARA_dummy.webp',
  'FB01-005_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-005_p2.webp?v1',
  'FB02-033_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-033_p1.webp?v1',
  'FB02-039_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-039_p1.webp?v1',
  'FB02-042_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-042_p1.webp?v1',
  'FB02-085_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-085_p1.webp?v1',
  'FB02-086_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-086_p1.webp?v1',
  'FB02-132_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-132_p1.webp?v1',
  'FB02-137_CP': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-137_p1.webp?v1',
  'FB01-005_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-005_p3.webp?v1',
  'FB02-033_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-033_p2.webp?v1',
  'FB02-039_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-039_p2.webp?v1',
  'FB02-042_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-042_p2.webp?v1',
  'FB02-085_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-085_p2.webp?v1',
  'FB02-086_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-086_p2.webp?v1',
  'FB02-132_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-132_p2.webp?v1',
  'FB02-137_CP_A': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-137_p2.webp?v1',
  'BT1-111_PR02': '/BT1-111_PR02.png',
  'DB1-066_W': '/DB1-066_W.png',
  'BT7-023_W': '/BT7-023_W.png',
  'BT9-122_W': '/BT9-122_W.png',
  'BT10-033_W': '/BT10-033_W.png',
  'BT10-096_W': '/BT10-096_W.png',
  'DB3-134_W': '/DB3-134_W.png',
  'DB2-108_W': '/DB2-108_W.png',
  'DB3-015_W': '/DB3-015_W.png',
  'P-262_W': '/P-262_W.png',
  'BT8-121_W': '/BT8-121_W.png',
  'BT9-103_W': '/BT9-103_W.png',
  'BT10-030_W': '/BT10-030_W.png',
  'BT10-088_W': '/BT10-088_W.png',
  'BT10-141_W': '/BT10-141_W.png',
  'BT11-042_W': '/BT11-042_W.png',
  'BT10-115_W': '/BT10-115_W.png',
  'BT13-030_W': '/BT13-030_W.png',
  'BT13-135_W': '/BT13-135_W.png',
  'BT15-119_W': '/BT15-119_W.png',
  'DB2-061_W': '/DB2-061_W.png',
  'P-247_W': '/P-247_W.png',
  'P-514': 'https://tcgplayer-cdn.tcgplayer.com/product/481573_in_1000x1000.jpg',
  'P-515': 'https://tcgplayer-cdn.tcgplayer.com/product/481575_in_1000x1000.jpg',
  'P-516': 'https://tcgplayer-cdn.tcgplayer.com/product/481574_in_1000x1000.jpg',
  'P-588': 'https://tcgplayer-cdn.tcgplayer.com/product/585120_in_1000x1000.jpg',
  'P-589': 'https://tcgplayer-cdn.tcgplayer.com/product/585118_in_1000x1000.jpg',
  'P-590': 'https://tcgplayer-cdn.tcgplayer.com/product/585117_in_1000x1000.jpg',
  'P-591': 'https://tcgplayer-cdn.tcgplayer.com/product/585116_in_1000x1000.jpg',
  'P-592': 'https://tcgplayer-cdn.tcgplayer.com/product/585119_in_1000x1000.jpg',
  'BT24-118_SPR02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT24-118_SPR.png',
  'BT24-122_SPR02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT24-122_SPR.png',
  'BT24-108_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT24-108_PR.png',
  'E-84': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/E-84.webp?v1',
  'E-22': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-22-battle-hour-2025-son-goku-ultra-instinct.webp',
  'E-23': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-23-battle-hour-2025-dokkan-battle.webp',
  'E-24': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-24-battle-hour-2025-dragon-ball-fighterz.webp',
  'E-25': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-25-battle-hour-2025-dragon-ball-sparking-zero.webp',
  'E-26': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-26-battle-hour-2025-dragon-ball-legends.webp',
  'E-27': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-27-battle-hour-2025-dragon-ball-daima.webp',
  'E-28': 'https://static.fw.dbscards.fr/cards/en/bh25/image-trading-cards-dragon-ball-super-card-game-fusion-world-tcg-dbscards-en-e-28-battle-hour-2025-dragon-ball-card-game-fusion-world.webp',
  'E-91': 'https://tcgplayer-cdn.tcgplayer.com/product/675346_in_1000x1000.jpg',
  'E-92': 'https://storage.googleapis.com/images.pricecharting.com/pc2w73kon4mzz63y/1600.jpg',
  'E-131': 'https://cdn.snkrdunk.com/upload_bg_removed/2026-01-25-001-of.webp?size=l',
  'E-133': 'https://tcgplayer-cdn.tcgplayer.com/product/684113_in_1000x1000.jpg',
  'E-134': 'https://tcgplayer-cdn.tcgplayer.com/product/684116_in_1000x1000.jpg',
  'E-135': 'https://tcgplayer-cdn.tcgplayer.com/product/684117_in_1000x1000.jpg',
  'E-136': 'https://tcgplayer-cdn.tcgplayer.com/product/684118_in_1000x1000.jpg',
  'E-137': 'https://tcgplayer-cdn.tcgplayer.com/product/684119_in_1000x1000.jpg',
  'E-138': 'https://tcgplayer-cdn.tcgplayer.com/product/684120_in_1000x1000.jpg',
  'E-139': 'https://tcgplayer-cdn.tcgplayer.com/product/684121_in_1000x1000.jpg',

  // Fusion World FB05 Specific Overrides
  'FB01-049_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB01-049_p4.webp?v1',
  'FB02-035_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-035_p2.webp?v1',
  'FB02-044_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-044_p2.webp?v1',
  'FB02-089_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-089_p2.webp?v1',
  'FB03-020_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-020_p2.webp?v1',
  'FB03-042_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-042_p2.webp?v1',
  'FB03-125_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-125_p2.webp?v1',
  'FB04-091_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-091_p3.webp?v1',
  'FS05-16_A_FB05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-16_p3.webp?v1',

  // Fusion World FB06, FB07, FB08 Overrides
  'FB03-039_A_FB06': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB03-039_p2.webp?v1',
  'FB04-095_A_FB07': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-095_p4.webp?v1',
  'FS05-03_A_FB07': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FS05-03_p2.webp?v1',
  'FP-027_A_FB07': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FP-027_p2.webp?v1',
  'FB02-049_A_FB08': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB02-049_p3.webp?v1',
  'FB04-105_A_FB08': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB04-105_p2.webp?v1',
  'FB02-133_RE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/uO3dSaidPNSES1DP/EN_FW_FB02-133_Battle_SR_RE_dummy.png?_=',
  'FB01-015_RE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/p4HzxmvsliUaceBp/EN_FW_FB01-015_Battle_SR_RE_dummy.png?_=',
  'FP-001_SE': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/8WPbTaExTskbglaR/EN_FW_FP001_PR_PARA_dummy.png?_=',
  'SL-CH-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/9kIScwUijTQ7mUsA/FW_CHAMPIONSHIP_sleeve_wave1_dummy.png?_=',
  'PM-CH-W1': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/04/24/bpzkY5QiMzlJVRCN/FW_CHAMPIONSHIP_dummy.png?_=',

  // Judge Packs
  'BT1-055_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-055-c-judge-whiss-coercion.webp',
  // Event Pack 02
  'TB1-012_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/TB1-012_PR.png',
  'TB1-027_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/TB1-027_PR02.png',
  'P-047_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-047_PR.png',
  'P-057_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-057_PR.png',
  'P-060_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-060_PR.png',
  'P-062_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-062_PR.png',
  'TB1-088_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/TB1-088_PR.png',
  'EX3-14_EP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/EX03-14_PR.png',
  // Event Pack 03
  'BT1-052_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-052_PR.png',
  'BT1-109_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-109_PR.png',
  'BT3-120_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT3-120_PR.png',
  'BT4-012_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-012_PR.png',
  'BT4-048_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-048_PR.png',
  'BT4-093_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-093_PR.png',
  'BT4-118_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-118_PR.png',
  'BT5-117_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT5-117_PR.png',
  'BT6-060_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT6-060_PR.png',
  'BT2-104_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt2-104-uc-judge-destructive-occupation-frieza.webp',
  'BT5-038_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-038-sr-judge-gogeta-hero-revived.webp',
  'BT1-076_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-076-c-judge-broly-dawn-of-the-rampage.webp',
  'BT4-102_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt4-102-c-judge-dimension-support-trunks.webp',
  'BT1-108_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-108-c-judge-bad-ring-laser.webp',
  'BT5-073_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-073-c-judge-infernal-villainy-cell.webp',
  'BT2-067_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt2-067-c-judge-zen-oh-button.webp',
  'BT5-075_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-075-c-judge-shocking-death-ball.webp',
  'P-077_JP05': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-077-pr-judge-everybodys-pal-yamcha.webp',
  'BT5-115_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-115-c-judge-power-burst.webp',
  'BT5-109_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-109-c-judge-dende-new-to-the-job.webp',
  'BT6-107_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-107-sr-judge-son-goku-the-adventure-begins.webp',
  'BT5-101_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-101-c-judge-time-magic.webp',
  'P-090_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-090-pr-judge-surprise-attack-frieza.webp',
  'BT5-050_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-050-c-judge-dimension-magic.webp',
  'TB3-048_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb3-048-uc-judge-preemptive-strike.webp',
  'EB1-13_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560650_in_1000x1000.jpg',
  'BT11-042_EP15': 'https://static.dbscards.fr/cards/en/evp15/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt11-042-sr-event-pack-15-baby-golden-avenger.webp',
  'DB3-059_EP15': 'https://static.dbscards.fr/cards/en/evp15/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-059-uc-event-pack-15-vegeta-protecting-his-loved-ones.webp',
  'BT9-087_EP15': 'https://static.dbscards.fr/cards/en/evp15/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-087-uc-event-pack-15-petrification.webp',
  'BT12-120_EP15': 'https://static.dbscards.fr/cards/en/evp15/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt12-120-r-event-pack-15-dragon-thunder.webp',
  'P-191_EP15': 'https://static.dbscards.fr/cards/en/evp15/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-191-pr-event-pack-15-jiren-pride-of-universe-11.webp',
  'BT12-113_EP16': 'https://static.dbscards.fr/cards/en/evp16/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt12-113-sr-event-pack-16-oceanus-shenron-the-anemancer.webp',
  'BT12-128_EP16': 'https://static.dbscards.fr/cards/en/evp16/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt12-128-c-event-pack-16-son-goku-true-fighting-spirit.webp',
  'EX6-30_EP16': 'https://static.dbscards.fr/cards/en/evp16/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex06-30-ex-event-pack-16-bardock-awakened-instincts.webp',
  'EX6-36_EP16': 'https://static.dbscards.fr/cards/en/evp16/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex06-36-ex-event-pack-16-a-crack-in-spacetime.webp',
  // Event Pack 17
  'BT22-127_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT22-127_PR02.png',
  'BT7-073_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT7-073_PR.png',
  'BT7-073_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT7-073_PR.png',
  'BT7-057_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT7-073_PR.png',
  'DB3-136_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/DB3-136_PR02.png',
  'P-082_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-082_PR02.png',
  'BT12-108_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT12-108_PR.png',
  'BT17-134_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT17-134_PR.png',
  'BT24-133_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT24-133_PR.png',
  'BT4-107_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-107_PR.png',
  'BT25-083_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-083_PR.png',
  'DB3-012_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/DB3-012_PR.png',
  'BT25-140_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-140_PR.png',
  'BT22-112_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT22-112_PR.png',
  'BT21-062_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT21-062_PR.png',
  'BT25-130_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-130_PR.png',
  'BT24-063_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT24-063_PR.png',
  'BT20-011_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT20-011_PR.png',
  'BT25-009_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-009_PR.png',
  'BT25-107_EP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-107_PR.png',
  // Event Pack 18
  'BT10-055_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT10-055_PR02.png',
  'BT11-127_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-127_PR02.png',
  'BT13-082_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT13-082_PR02.png',
  'BT16-045_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT16-045_SPR02.png',
  'BT23-115_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT23-115_PR02.png',
  'BT25-120_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-120_SPR02.png',
  'BT27-019_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-019_PR02.png',
  'BT27-019_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-019_PR.png',
  'BT27-039_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-039_PR.png',
  'BT27-059_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-059_PR.png',
  'BT27-084_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-084_PR.png',
  'BT27-095_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-095_PR.png',
  'BT27-048_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT27-048_PR02.png',
  'BT8-015_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT8-015_PR.png',
  'BT8-074_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT8-074_PR.png',
  'DB3-101_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/DB3-101_PR.png',
  'P-614_EP18': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-614_PR02.png',
  'BT5-108_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517076_in_1000x1000.jpg',
  'BT6-026_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-026-c-judge-is-that-all-you-ve-got.webp',
  'BT6-025_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-025-c-judge-transcendent-strike.webp',
  'BT5-023_JP06': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-023-c-judge-afterimage-technique.webp',
  'EX3-08_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex03-08-ex-judge-awe-inspiring-intimidator-ssb-vegito.webp',
  'EX4-03_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex04-03-ex-judge-ssb-gogeta-resonant-explosion.webp',
  'P-112_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-112-pr-judge-super-baby-1-parasitic-menace.webp',
  'BT3-008_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt3-008-sr-judge-fearless-pan.webp',
  'BT1-025_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-025-c-judge-vadoss-assistance.webp',
  'BT7-120_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-120-r-judge-beerus-fickle-god.webp',
  'TB2-024_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb2-024-r-judge-awakening-talent-pan.webp',
  'BT6-117_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-117-r-judge-four-star-ball.webp',
  'BT7-117_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-117-r-judge-broly-demonic-origins.webp',
  'P-159_JP07': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-159-pr-judge-mutaito-skill-of-sage.webp',
  'BT7-106_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-106-r-judge-towa-dimension-leaper.webp',
  'DB1-048_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-048-sr-judge-piccolo-assimilated-ability.webp',
  'BT8-113_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt8-113-r-judge-whis-the-spectator.webp',
  'BT8-053_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt8-053-r-judge-beerus-godly-majesty.webp',
  'BT7-078_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-078-r-judge-champa-the-trickster.webp',
  'BT8-120_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt8-120-r-judge-android-17-protector-of-wildlife.webp',
  'BT9-102_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-102-r-judge-mecha-frieza-energy-blight.webp',
  'BT7-107_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-107-c-judge-assembling-the-squad.webp',
  'BT7-029_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-029-r-judge-undying-spirit-son-gohan.webp',
  'BT9-123_JP08': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-123-r-judge-anilaza-the-soaring-colossus.webp',
  'BT10-140_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-140-r-judge-secret-identity-masked-saiyan.webp',
  'DB1-020_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-020-sr-judge-galick-cannon.webp',
  'DB1-096_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-096-dpr-judge-uneasy-alliance-son-goku.webp',
  'BT6-013_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-013-c-judge-veku-the-fragile.webp',
  'BT4-061_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt4-061-c-judge-lord-slug-returned-to-form.webp',
  'BT3-120_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt3-120-c-judge-haru-haru-attacker-majin.webp',
  'BT6-012_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt6-012-r-judge-veku-contents-under-pressure.webp',
  'TB1-044_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb1-044-c-judge-sorrel-the-small-warrior.webp',
  'EX5-02_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex05-02-ex-judge-boujack-pirates-pride.webp',
  'TB3-025_JP09': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb3-025-uc-judge-planetary-invader-tora.webp',
  'EX6-35_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex06-35-ex-judge-fu-the-dark-banisher.webp',
  'P-241_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-241-pr-judge-ss3-gohan-masters-surpassed.webp',
  'P-206_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-206-pr-judge-ss-rose-goku-black-divine-prosperity.webp',
  'DB2-143_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-143-sr-judge-koitsukai-mechanical-courage.webp',
  'BT9-112_JP_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-112-uc-judge-cell-perfection-surpassed-back.webp',
  'BT9-112_JP10': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT9-112.png',
  'BT9-112_JP10_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-112-uc-judge-cell-perfection-surpassed-back.webp',
  'DB1-101_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-101-dpr-judge-son-goku-father-and-son.webp',
  'BT9-100_JP_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-100-uc-judge-ultra-instinct-son-goku-limits-surpassed-back.webp',
  'BT9-100_JP10': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT9-100.png',
  'BT9-100_JP10_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-100-uc-judge-ultra-instinct-son-goku-limits-surpassed-back.webp',
  'BT10-064_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-064-uc-judge-demigra-unison-of-sorcery.webp',
  'BT11-063_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt11-063-r-judge-ss3-vegito-peerless-warrior.webp',
  'DB3-015_JP10': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-015-sr-judge-king-piccolo-the-new-ruler.webp',
  'P-003_JP01': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-003_PR02.png',
  'P-015_JP01': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-015_PR02.png',
  'P-016_JP01': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-016_PR.png', // Fallback to _PR if _PR02 doesn't exist for P-016
  'P-018_JP01': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-018_PR.png',
  'P-030_JP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-030_PR.png',
  'P-032_JP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-032_PR.png',
  'P-033_JP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-033_PR02.png',
  'P-035_JP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-035_PR.png',
  'P-036_JP02': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-036_PR.png',
  'P-036_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-036_PR02.png',
  'P-040_JP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-040_PR.png',
  'P-048_JP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-048_PR.png',
  'P-049_JP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-049_PR.png',
  'P-052_JP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-052_PR.png',
  'P-053_JP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-053_PR.png',
  'BT1-005_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-005_PR.png',
  'BT1-080_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-080_PR.png',
  'BT1-110_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-110_PR.png',
  'BT2-010_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT2-010_PR.png',
  'BT2-044_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT2-044_PR.png',
  'BT2-060_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT2-060_PR.png',
  'BT2-093_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT2-093_PR.png',
  'BT3-110_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT3-110_PR.png',
  'BT4-073_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-073_PR.png',
  'BT4-103_JP04': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-103_PR.png',
  'BT1-083_JP_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-083-r-judge-ultimate-form-golden-frieza-back.webp',
  'BT1-083_JP11': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-083_PR.png',
  'BT1-083_JP11_b': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-083-r-judge-ultimate-form-golden-frieza-back.webp',
  'BT13-034_JP11': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt13-034-sr-judge-majin-buu-assault-of-the-agents-of-destruction.webp',
  'EB1-37_JP11': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-eb1-37-c-judge-homicidal-clones.webp',
  'BT5-103_JP11': 'https://static.dbscards.fr/cards/en/jp/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-103-c-judge-personal-ambition.webp',
  'EB1-22_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/267947_in_800x800.jpg',
  'EB1-11_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/267946_in_800x800.jpg',
  'EB1-48_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/267945_in_800x800.jpg',
  'EX13-34_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/267944_in_800x800.jpg',
  'BT10-147_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/267939_in_800x800.jpg',
  'EX13-30_JP11': 'https://tcgplayer-cdn.tcgplayer.com/product/270779_in_800x800.jpg',
  'BT13-073_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287463_in_800x800.jpg',
  'BT15-128_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287469_in_800x800.jpg',
  'BT14-082_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287468_in_800x800.jpg',
  'BT13-137_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287465_in_800x800.jpg',
  'BT10-055_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287457_in_800x800.jpg',
  'BT16-030_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287471_in_800x800.jpg',
  'BT16-124_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287474_in_800x800.jpg',
  'EB1-20_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287479_in_800x800.jpg',
  'BT11-127_JP12': 'https://tcgplayer-cdn.tcgplayer.com/product/287460_in_800x800.jpg',
  'EX20-01_JP_b': 'https://tcgplayer-cdn.tcgplayer.com/product/287480_in_800x800.jpg',
  'EX20-01_JP12': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/EX20-01_PR.png',
  'EX20-01_JP12_b': 'https://tcgplayer-cdn.tcgplayer.com/product/287480_in_800x800.jpg',
  // Judge Pack 13
  'BT10-058_JP13': '/BT10-058_JP.png',
  'BT17-059_JP_b': '/BT17-059_JP.png',
  'BT17-059_JP13': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT17-059.png',
  'BT17-059_JP13_b': '/BT17-059_JP.png',
  'BT17-135_JP13': '/BT17-135_JP.png',
  'DB1-064_JP13': '/DB1-064_JP.png',
  'DB2-136_JP13': '/DB2-136_JP.png',
  'DB3-059_JP13': '/DB3-059_JP.png',
  'DB3-101_JP13': '/DB3-101_JP.png',
  'EX6-02_JP13': 'https://i.ebayimg.com/images/g/Jh0AAOSwwYdoAq1X/s-l1200.jpg',
  'SD2-04_JP13': '/SD2-04_JP.png',
  'SD8-04_JP13': '/SD8-04_JP.png',
  // Judge Pack 14
  'BT1-043_JP14': '/BT1-043.png',
  'BT8-032_JP14': '/BT8-032.png',
  'BT9-109_JP14': '/BT9-109.png',
  'BT13-121_JP14': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT13-121.png',
  'BT13-121_JP14_b': '/BT13-121.png',
  'BT18-005_JP14': '/BT18-005.png',
  'BT18-128_JP14': '/BT18-128.png',
  'DB3-077_JP14': '/DB3-077.png',
  'P-270_JP14': '/P-270.png',
  'P-402_JP14': '/P-402.png',
  'P-405_JP14': '/P-405.png',
  // Judge Pack 15
  'BT19-055_JP15': '/BT19-055.png',
  'BT14-073_JP15': '/BT14-073.png',
  'EX21-16_JP15': '/EX21-16.png',
  'SD17-05_JP15': '/SD17-05.png',
  'BT9-002_JP15': '/BT9-002_a.png',
  'BT9-002_JP15_b': '/BT9-002_b.png',
  'P-275_JP15': '/P-275.png',
  'P-292_JP15': '/P-292.png',
  'DB1-101_JP15': '/DB1-101.png',
  'BT13-142_JP15': '/BT13-142.png',
  'P-419_JP15': '/P-419.png',
  // Judge Pack 16
  'BT8-022_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT8-022_PR.png',
  'BT10-088_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT10-088_PR03.png',
  'EX21-15_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/EX21-15_PR.png',
  'BT13-020_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT13-020_PR.png',
  'BT12-115_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT12-115_PR.png',
  'BT21-051_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT21-051_PR.png',
  'P-219_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-219_PR03.png',
  'P-159_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-159_PR03.png',
  'BT14-135_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT14-135_PR02.png',
  'P-321_JP16': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-321_PR.png',
  // Judge Pack 17
  'EX19-24_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/EX19-24_PR.png',
  'BT13-073_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT13-073_PR.png',
  'BT25-052_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-052_PR.png',
  'BT10-090_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT10-090_PR.png',
  'P-359_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-359_PR.png',
  'BT10-123_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT10-123_PR02.png',
  'BT25-005_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-005_PR.png',
  'P-453_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-453_PR02.png',
  'BT11-053_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-053_PR02.png',
  'BT16-087_JP17': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT16-087_PR.png',
  // Judge Pack 18
  'DB2-097_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672072_in_800x800.jpg',
  'BT14-007_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672119_in_800x800.jpg',
  'BT15-033_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672118_in_800x800.jpg',
  'BT7-110_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672115_in_800x800.jpg',
  'BT19-049_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672114_in_800x800.jpg',
  'P-643_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672070_in_800x800.jpg',
  'BT24-113_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672112_in_800x800.jpg',
  'BT15-063_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672117_in_800x800.jpg',
  'BT7-087_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672116_in_800x800.jpg',
  'BT24-088_JP18': 'https://tcgplayer-cdn.tcgplayer.com/product/672113_in_800x800.jpg',
  // Tokens
  'TK-01': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-01-shadow-token.webp',
  'TK-01_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-01-v2-shadow-token.webp',
  'TK-01_PR02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-01-v3-shadow-token.webp',
  'TK-01_PR03': 'https://static.dbscards.fr/cards/en/tk/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-01-championship-token-card-pack-2023-volume-1-shadow-token.webp',
  'TK-02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-02-meda-token.webp',
  'TK-02_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-02-v2-meda-token.webp',
  'TK-02_PR02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-02-v3-meda-token.webp',
  'TK-03': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-03-ghost-token.webp',
  'TK-03_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-03-v2-ghost-token.webp',
  'TK-03_PR02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-03-v3-ghost-token.webp',
  'TK-03_PR03': 'https://static.dbscards.fr/cards/en/tk/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-03-championship-token-card-pack-2023-volume-1-ghost-token.webp',
  'TK-04': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-04-chilleds-army-token.webp',
  'TK-04_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-04-v2-chilleds-army-token.webp',
  'TK-04_PR02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-04-v3-chilleds-army-token.webp',
  'TK-05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-05-cell-junior-token.webp',
  'TK-05_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-05-v2-cell-junior-token.webp',
  'TK-05_PR02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-05-v3-cell-junior-token.webp',
  'TK-06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-06-v2-clone-token.webp',
  'TK-06_PR': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-06-clone-token.webp',
  'TK-07': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-07-saibaiman-token.webp',
  'TK-08': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-08-friezas-army-token.webp',
  'TK-09': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-09-machine-mutant-token.webp',
  'TK-010': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-010-afterimage-token.webp',
  'TK-011': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-011-majin-token.webp',
  'TK-011_PR': 'https://static.dbscards.fr/cards/en/tk/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-11-championship-token-card-pack-2023-volume-1-majin-token.webp',
  'TK-012': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-012-meta-cooler-token.webp',
  'TK-013': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-013-multi-form-token.webp',
  'TK-014': 'https://static.dbscards.fr/cards/en/tk/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-14-championship-token-card-pack-2023-volume-1-demon-realm-soldier-token.webp',
  'TK-015': 'https://static.dbscards.fr/cards/en/tk/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tk-15-championship-token-card-pack-2023-volume-1-earthling-token.webp',
  // Merit Cards
  'MC-01': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-001-celebrations-high-rank-player.webp',
  'MC-02': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-002-celebrations-super-high-rank-player.webp',
  'MC-03': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-003-release-tournament-super-warrior.webp',
  'MC-04': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-004-celebrations-high-rank-team.webp',
  'MC-05': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-005-celebrations-super-high-rank-team.webp',
  'MC-06': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-006-fledgling-fighter.webp',
  'MC-07': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-007-championship-top-16.webp',
  'MC-08': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-008-championship-finalist.webp',
  'MC-09': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-009-championship-finalist.webp',
  'MC-010': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-010-dbscg-championship-2019-warrior-universe-1.webp',
  'MC-011': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-011-dbscg-championship-2019-warrior-universe-2.webp',
  'MC-012': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-012-dbscg-championship-2019-warrior-universe-3.webp',
  'MC-013': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-013-dbscg-championship-2019-warrior-universe-4.webp',
  'MC-014': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-014-dbscg-championship-2019-warrior-universe-5.webp',
  'MC-015': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-015-dbscg-championship-2019-warrior-universe-6.webp',
  'MC-016': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-016-dbscg-championship-2019-warrior-universe-7.webp',
  'MC-017': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-017-dbscg-championship-2019-warrior-universe-8.webp',
  'MC-018': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-018-dbscg-championship-2019-warrior-universe-9.webp',
  'MC-019': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-019-dbscg-championship-2019-warrior-universe-10.webp',
  'MC-020': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-020-dbscg-championship-2019-warrior-universe-11.webp',
  'MC-021': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-021-dbscg-championship-2019-warrior-universe-12.webp',
  'MC-022': 'https://static.dbscards.fr/cards/en/mc/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-mc-022-dbscg-championship-top-16.webp',
  // Event Pack 10
  'BT14-007_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt14-007-sr-event-pack-10-zenkai-series-son-gohan-ultimate-essence.webp',
  'DB3-055_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-055-sr-event-pack-10-zenkai-series-son-gohan-hidden-might.webp',
  'BT14-063_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt14-063-sr-event-pack-10-zenkai-series-great-saiyaman-the-mysterious-hero.webp',
  'BT9-102_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-102-r-event-pack-10-zenkai-series-mecha-frieza-energy-blight.webp',
  'BT14-122_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt14-122-sr-event-pack-10-zenkai-series-ss4-bardock-spirit-resonance.webp',
  'BT14-135_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt14-135-sr-event-pack-10-zenkai-series-oceanus-shenron-negative-energy-explosion.webp',
  'EX6-27_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex06-27-ex-event-pack-10-zenkai-series-swift-retaliation-cooler.webp',
  'P-333_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-333-pr-event-pack-10-zenkai-series-intoxicated-by-justice.webp',
  'EB1-62_EP10': 'https://static.dbscards.fr/cards/en/evp10/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-eb1-62-sr-event-pack-10-zenkai-series-android-17-and-android-18-siblings-revived.webp',
  // Event Pack 11
  'BT13-130_EP11': 'https://static.dbscards.fr/cards/en/evp11/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt13-130-r-event-pack-11-ss4-vegeta-thwarting-the-dark-empire.webp',
  'EX11-07_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493352_in_600x600.jpg',
  'DB2-092_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493356_in_600x600.jpg',
  'DB3-040_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493353_in_600x600.jpg',
  'BT17-134_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493351_in_600x600.jpg',
  'DB3-013_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493354_in_600x600.jpg',
  'BT8-033_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493347_in_600x600.jpg',
  'DB2-156_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493355_in_600x600.jpg',
  'BT14-097_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/493350_in_600x600.jpg',
  // Event Pack 12
  'DB1-003_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-003-c-event-pack-12-zenkai-series-trunks-deluge-of-power.webp',
  'BT14-005_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt14-005-sr-event-pack-12-zenkai-series-son-goku-divine-presence.webp',
  'SD11-02_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-sd11-02-st-event-pack-12-zenkai-series-friendly-rival-frieza.webp',
  'BT11-035_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt11-035-r-event-pack-12-zenkai-series-son-gohan-babys-minion.webp',
  'DB1-036_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-036-c-event-pack-12-zenkai-series-shu-deluge-of-power.webp',
  'BT16-045_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt16-045-r-event-pack-12-zenkai-series-realm-of-the-gods-beerus-destroys.webp',
  'BT21-058_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt21-058-c-event-pack-12-zenkai-series-mr-buu-for-friendship.webp',
  'BT21-077_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt21-077-r-event-pack-12-zenkai-series-ss-son-goku-believing-in-his-son.webp',
  'DB3-089_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-089-uc-event-pack-12-zenkai-series-chi-chi-melee-matriarch.webp',
  'DB3-093_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-093-r-event-pack-12-zenkai-series-lord-slug-evil-invader.webp',
  'DB2-097_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-097-c-event-pack-12-zenkai-series-big-amour.webp',
  'EX13-14_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-ex13-14-ex-event-pack-12-zenkai-series-gokule-the-legendary-fusion-warrior.webp',
  'BT13-146_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt13-146-sr-event-pack-12-zenkai-series-king-vegeta-a-kingdom-lost.webp',
  'DB2-165_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-165-uc-event-pack-12-zenkai-series-sleepy-boy-technique.webp',
  'DB2-174_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-174-dar-event-pack-12-zenkai-series-beerus-and-whis-universe-7-destroyer-and-angel.webp',
  'EB1-55_EP12': 'https://static.dbscards.fr/cards/en/evp12/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-eb1-55-r-event-pack-12-zenkai-series-playtimes-over.webp',
  // Event Pack 13
  'DB3-101_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517097_in_1000x1000.jpg',
  'BT9-110_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517090_in_1000x1000.jpg',
  'BT10-090_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517091_in_1000x1000.jpg',
  'TB3-029_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517099_in_1000x1000.jpg',
  'EX13-04_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517098_in_1000x1000.jpg',
  'BT23-063_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517100_in_1000x1000.jpg',
  'BT8-031_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517079_in_1000x1000.jpg',
  'BT8-074_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517089_in_1000x1000.jpg',
  'BT8-015_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517078_in_1000x1000.jpg',
  'BT8-051_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517081_in_1000x1000.jpg',
  'BT18-006_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517092_in_1000x1000.jpg',
  'BT18-144_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517094_in_1000x1000.jpg',
  'BT22-136_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517096_in_1000x1000.jpg',
  'BT18-086_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517093_in_1000x1000.jpg',
  'BT22-134_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517095_in_1000x1000.jpg',
  'BT23-108_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517103_in_800x800.jpg',
  'BT5-112_EP03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT5-112_PR.png',
  'BT5-112_EP13': 'https://tcgplayer-cdn.tcgplayer.com/product/517077_in_1000x1000.jpg',
  // Event Pack 14
  'DB2-129_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543020_in_800x800.jpg',
  'BT14-060_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543011_in_800x800.jpg',
  'BT19-036_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543019_in_800x800.jpg',
  'P-383_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543022_in_800x800.jpg',
  'XD01-10_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543026_in_800x800.jpg',
  'BT13-082_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543010_in_800x800.jpg',
  'BT18-143_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543018_in_800x800.jpg',
  'BT11-132_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543009_in_800x800.jpg',
  'SD18-02_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543025_in_800x800.jpg',
  'BT18-069_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543017_in_800x800.jpg',
  'BT16-140_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543016_in_800x800.jpg',
  'P-159_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543021_in_800x800.jpg',
  'SD17-02_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543024_in_800x800.jpg',
  'BT16-018_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543012_in_800x800.jpg',
  'BT16-069_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543013_in_800x800.jpg',
  'BT16-092_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543014_in_800x800.jpg',
  'BT16-125_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543015_in_800x800.jpg',
  'SD14-05_EP14': 'https://tcgplayer-cdn.tcgplayer.com/product/543023_in_800x800.jpg',
  // Event Pack 15
  'BT13-151_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560644_in_800x800.jpg',
  'BT8-065_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560634_in_800x800.jpg',
  'BT12-120_EP12': 'https://tcgplayer-cdn.tcgplayer.com/product/560643_in_800x800.jpg',
  'BT10-077_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560640_in_800x800.jpg',
  'BT16-091_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560647_in_800x800.jpg',
  'BT10-030_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560639_in_800x800.jpg',
  'BT9-023_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560635_in_800x800.jpg',
  'EB1-63_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560654_in_800x800.jpg',
  'BT10-010_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560638_in_800x800.jpg',
  'P-113_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560655_in_800x800.jpg',
  'DB3-059_EP12': 'https://tcgplayer-cdn.tcgplayer.com/product/560649_in_800x800.jpg',
  'BT20-121_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560648_in_800x800.jpg',
  'BT15-073_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560646_in_800x800.jpg',
  'P-191_EP11': 'https://tcgplayer-cdn.tcgplayer.com/product/560656_in_800x800.jpg',
  'P-262_EP15': 'https://tcgplayer-cdn.tcgplayer.com/product/560657_in_800x800.jpg',
  // Event Pack 16
  'BT3-027_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620145_in_800x800.jpg',
  'BT21-052_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620156_in_800x800.jpg',
  'P-403_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620161_in_800x800.jpg',
  'BT5-073_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620146_in_800x800.jpg',
  'BT17-004_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620155_in_800x800.jpg',
  'P-455_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620164_in_800x800.jpg',
  'BT10-123_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620150_in_800x800.jpg',
  'BT12-113_EP10': 'https://tcgplayer-cdn.tcgplayer.com/product/620165_in_800x800.jpg',
  'BT10-062_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620147_in_800x800.jpg',
  'EX19-12_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620160_in_800x800.jpg',
  'BT13-137_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620154_in_800x800.jpg',
  'P-405_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620163_in_800x800.jpg',
  'TB1-023_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620162_in_800x800.jpg',
  'BT13-098_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620153_in_800x800.jpg',
  'EB1-20_EP16': 'https://tcgplayer-cdn.tcgplayer.com/product/620157_in_800x800.jpg',
  'BT5-008_EP04': 'https://tcgplayer-cdn.tcgplayer.com/product/196873_in_1000x1000.jpg',
  'BT5-041_EP04': 'https://tcgplayer-cdn.tcgplayer.com/product/196874_in_1000x1000.jpg',
  'BT5-061_EP04': 'https://rock-city-comics.myshopify.com/cdn/shop/files/87179c1a-0459-5abe-8a8c-0538446969a4.jpg?v=1770409928',
  'BT5-088_EP04': 'https://tcgplayer-cdn.tcgplayer.com/product/196879_in_1000x1000.jpg',
  'BT5-119_EP04': 'https://static.dbscards.fr/cards/en/evp04/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-119-uc-event-pack-04-world-peace.webp',
  'BT6-110_EP04': 'https://tier1games.com/cdn/shop/files/652552fc-a723-5025-a4ec-83d7f89a453b.jpg?v=1770409866&width=800',
  'BT6-114_EP04': 'https://tier1games.com/cdn/shop/files/14303113-526b-5daa-be49-53489be656d3.jpg?v=1770409831&width=800',
  'BT7-111_EP04': 'https://tier1games.com/cdn/shop/files/1d6ea4b6-cee5-5dc4-8c25-641f5816b0e8.png?v=1770409808&width=800',
  'P-105_EP04': 'https://tier1games.com/cdn/shop/files/2bc99204-f7a4-5c4c-b9e6-cca442682137.jpg?v=1770409872&width=800',
  'EX3-08_EP04': 'https://tier1games.com/cdn/shop/files/87d58605-c3af-5cee-9240-f7a6fcd43f02.jpg?v=1770409817&width=800',
  'BT1-027_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt1-027-c-event-pack-05-rainbow-cabbas-awakening.webp',
  'BT3-017_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt3-017-c-event-pack-05-rainbow-dr-myuu-under-babys-control.webp',
  'BT3-113_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt3-113-c-event-pack-05-rainbow-supreme-kai-of-time-worlds-protector.webp',
  'BT5-108_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-108-c-event-pack-05-rainbow-kami-global-unifier.webp',
  'BT6-057_EP05': 'https://res.cloudinary.com/csicdn/image/upload/c_pad,fl_lossy,h_300,q_auto,w_300/v1/Images/Products/Misc%20Art/Promo/full/dbs_BT6057ep5v2.jpg',
  'BT8-115_EP05': 'https://tier1games.com/cdn/shop/files/32646c4c-d8b1-565a-ad19-d308489952e0.jpg?v=1769612411&width=800',  'TB2-011_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb2-011-c-event-pack-05-rainbow-heroic-duo-videl.webp',
  'TB2-067_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb2-067-uc-event-pack-05-rainbow-announcer-play-by-play-pro.webp',
  'TB3-065_EP05': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb3-065-c-event-pack-05-rainbow-no-escape-son-goku.webp',
  'BT7-103_EP05': 'https://tier1games.com/cdn/shop/files/c273b7b2-9095-59ae-bcb6-27d59b66cf0e.jpg?v=1770408793&width=800',
  'TB3-009_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb3-009-c-event-pack-2020-unison-warrior-series-strikeforce-jeice.webp',
  'BT9-018_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-018-uc-event-pack-2020-unison-warrior-series-we-are-universe-7.webp',
  'BT9-037_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-037-uc-event-pack-2020-unison-warrior-series-tournament-of-power-arena.webp',
  'BT9-039_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-039-uc-event-pack-2020-unison-warrior-series-cell-android-absorber.webp',
  'DB1-040_EP02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-040-c-event-pack-2020-unison-warrior-series-desperate-measures.webp',
  'DB1-040_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-040-c-event-pack-2020-unison-warrior-series-desperate-measures.webp',
  'BT2-060_EP03': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt2-060-uc-event-pack-2020-unison-warrior-series-zen-oh-the-plain-god.webp',
  'BT2-060_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt2-060-uc-event-pack-2020-unison-warrior-series-zen-oh-the-plain-god.webp',
  'DB1-064_EP02': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-064-sr-event-pack-2020-unison-warrior-series-great-ape-son-goku-saiyan-instincts.webp',
  'DB1-064_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db1-064-sr-event-pack-2020-unison-warrior-series-great-ape-son-goku-saiyan-instincts.webp',
  'BT5-070_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt5-070-uc-event-pack-2020-unison-warrior-series-android-20-vile-creator.webp',
  'BT7-100_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt7-100-uc-event-pack-2020-unison-warrior-series-son-goku-making-an-entrance.webp',
  'BT9-114_EP06': 'https://static.dbscards.fr/cards/en/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-114-uc-event-pack-2020-unison-warrior-series-cell-devourer-of-the-masses.webp',
  'DB2-042_EP07': 'https://static.dbscards.fr/cards/en/evp07/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-042-uc-event-pack-07-dr-rota-unknown-potential.webp',
  'SD8-05_EP07': 'https://static.dbscards.fr/cards/en/evp07/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-sd8-05-st-event-pack-07-cheelai-frieza-force-soldier.webp',
  'DB2-119_EP07': 'https://static.dbscards.fr/cards/en/evp07/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-119-uc-event-pack-07-chappil-the-iron-drake.webp',
  'BT10-126_EP07': 'https://static.dbscards.fr/cards/en/evp07/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-126-r-event-pack-07-majin-buu-wickedness-incarnate.webp',
  'DB1-038_EP07': 'https://www.mawo-cards.com/artikel/4929/Janemba-Infernal-Intruder-_439.jpg',
  'DB2-127_EP07': 'https://tier1games.com/cdn/shop/files/4c37b11c-91ab-54df-ad16-b0c4d7e868e1.jpg?v=1770839179&width=800',
  'P-248_EP02': 'https://tier1games.com/cdn/shop/files/68a31230-5630-5cba-87ad-0a7c62363437.jpg?v=1770839964&width=800',
  'P-248_EP07': 'https://tier1games.com/cdn/shop/files/68a31230-5630-5cba-87ad-0a7c62363437.jpg?v=1770839964&width=800',
  'DB2-146_EP07': 'https://tier1games.com/cdn/shop/files/faee5de1-fcac-575e-b65a-5af421dc400f.jpg?v=1770839182&width=800',
  'DB1-052_EP07': 'https://tier1games.com/cdn/shop/files/22852b60-d0f9-584f-92af-3861604d2194.jpg?v=1770839187&width=800',
  'SD8-04_EP07': 'https://tier1games.com/cdn/shop/files/5d94e8d3-470d-539b-9f93-0bef58352312.jpg?v=1770839183&width=800',
  'BT10-044_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-044-sr-event-pack-08-uws-boost-ss-trunks-god-sealing-technique.webp',
  'TB3-047_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-tb3-047-r-event-pack-08-uws-boost-frieza-army-healing-pod.webp',
  'BT10-105_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-105-sr-event-pack-08-uws-vegeta-prideful-transformation.webp',
  'BT10-145_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt10-145-r-event-pack-08-uws-son-goku-and-hit-supreme-alliance.webp',
  'DB2-160_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db2-160-r-event-pack-08-uws-not-even-a-scratch.webp',
  'P-219_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-219-pr-event-pack-08-uws-ss2-trunks-heroic-prospect.webp',
  'P-261_EP03': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-261-pr-event-pack-08-uws-ss4-bardock-fighting-against-fate.webp',
  'P-261_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-261-pr-event-pack-08-uws-ss4-bardock-fighting-against-fate.webp',
  'P-263_EP02': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-263-pr-event-pack-08-uws-masked-saiyan-brainwashed-no-more.webp',
  'P-263_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-263-pr-event-pack-08-uws-masked-saiyan-brainwashed-no-more.webp',
  'P-274_EP08': 'https://static.dbscards.fr/cards/en/evp08/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-274-pr-event-pack-08-uws-boost-launch-feminine-wiles.webp',
  'BT10-088_TS': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT10-088_PR.png',
  'BT10-088_EP08': '/BT10-088_EP08.jpg',
  'BT12-004_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt12-004-sr-event-pack-09-piccolo-jr-descendant-of-the-king.webp',
  'BT16-012_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt16-012-r-event-pack-09-ssb-vegeta-for-the-universes-survival.webp',
  'BT11-103_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt11-103-c-event-pack-09-hire-dragon.webp',
  'DB3-115_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-db3-115-sr-event-pack-09-piccolo-jr-eradicator-of-peace.webp',
  'BT9-132_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt9-132-iar-event-pack-09-cells-earth-destroying-kamehameha.webp',
  'BT13-137_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-bt13-137-c-event-pack-09-dabura-ritual-at-hand.webp',
  'P-220_EP09': 'https://www.cardtrader.com/uploads/blueprints/image/237195/show_ssb-vegito-soaring-blow-event-pack-9-alternate-foil-event-pack.jpg',
  'P-288_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-288-pr-event-pack-09-supreme-kai-of-time-summoned-from-another-dimension.webp',
  'P-331_EP04': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-331-pr-event-pack-09-mecha-frieza-robotic-riposte.webp',
  'P-331_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-p-331-pr-event-pack-09-mecha-frieza-robotic-riposte.webp',
  'EB1-35_EP02': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-eb1-35-sr-event-pack-09-rozie-blast-manipulator.webp',
  'EB1-35_EP09': 'https://static.dbscards.fr/cards/en/evp09/image-trading-cards-dragon-ball-super-card-game-tcg-dbscards-en-eb1-35-sr-event-pack-09-rozie-blast-manipulator.webp',
  // Energy Markers
  'M-01': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'M-02': 'https://tcgplayer-cdn.tcgplayer.com/product/588330_in_800x800.jpg',
  'M-03': 'https://tcgplayer-cdn.tcgplayer.com/product/588331_in_800x800.jpg',
  'M-04': 'https://tcgplayer-cdn.tcgplayer.com/product/588332_in_800x800.jpg',
  'M-05': 'https://tcgplayer-cdn.tcgplayer.com/product/588334_in_800x800.jpg',
  'M-06': 'https://tcgplayer-cdn.tcgplayer.com/product/588335_in_800x800.jpg',
  'M-07': 'https://tcgplayer-cdn.tcgplayer.com/product/588336_in_800x800.jpg',
  'M-08': '/m-08.png',
  'M-09': 'https://tcgplayer-cdn.tcgplayer.com/product/646851_in_800x800.jpg',
  'M-10': 'https://tcgplayer-cdn.tcgplayer.com/product/646850_in_800x800.jpg',
  'M-11': 'https://tcgplayer-cdn.tcgplayer.com/product/646849_in_800x800.jpg',
  'M-11_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/646852_in_800x800.jpg',
  'M-12': 'https://tcgplayer-cdn.tcgplayer.com/product/646848_in_800x800.jpg',
  'M-13': 'https://tcgplayer-cdn.tcgplayer.com/product/646847_in_800x800.jpg',
  'M-14': 'https://tcgplayer-cdn.tcgplayer.com/product/654531_in_800x800.jpg',
  'M-14_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652323_in_800x800.jpg',
  'M-15': 'https://tcgplayer-cdn.tcgplayer.com/product/655101_in_800x800.jpg',
  'M-15_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652325_in_800x800.jpg',
  'M-16': 'https://tcgplayer-cdn.tcgplayer.com/product/655103_in_800x800.jpg',
  'M-16_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652321_in_800x800.jpg',
  'M-17': 'https://tcgplayer-cdn.tcgplayer.com/product/655102_in_800x800.jpg',
  'M-17_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652322_in_800x800.jpg',
  'M-18': 'https://tcgplayer-cdn.tcgplayer.com/product/655105_in_800x800.jpg',
  'M-18_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652319_in_800x800.jpg',
  'M-19': 'https://tcgplayer-cdn.tcgplayer.com/product/655104_in_800x800.jpg',
  'M-19_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652320_in_800x800.jpg',
  'M-20': 'https://tcgplayer-cdn.tcgplayer.com/product/655106_in_800x800.jpg',
  'M-20_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652317_in_800x800.jpg',
  'M-21': 'https://tcgplayer-cdn.tcgplayer.com/product/655100_in_800x800.jpg',
  'M-21_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652318_in_800x800.jpg',
  'M-22': 'https://tcgplayer-cdn.tcgplayer.com/product/655108_in_800x800.jpg',
  'M-22_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652313_in_800x800.jpg',
  'M-23': 'https://tcgplayer-cdn.tcgplayer.com/product/655107_in_800x800.jpg',
  'M-23_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/652315_in_800x800.jpg',
  'M-24': 'https://tcgplayer-cdn.tcgplayer.com/product/675283_in_800x800.jpg',
  'M-24_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/604550546_1474153458046115_5333822660919197692_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=hfiLbQwHVYUQ7kNvwG-YvKG&_nc_oc=AdpgsU55UXqdSCovyDmHjmHSZXBw3obFzCQ9GXOsI2vduLZ4RxOJmOmEcGUwL3KHvIU&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=FkufjYq4nJGSMcaDi_ulbQ&_nc_ss=7b2a8&oh=00_Af4iSJcyf3VqVIvi6BzfPRYYK9Z7sSks_q0ICNbWRPaIGw&oe=69FC312E',
  'M-25': 'https://tcgplayer-cdn.tcgplayer.com/product/675287_in_800x800.jpg',
  'M-25_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/605230839_1474153491379445_8867606235611268216_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=13d280&_nc_ohc=XJpFdGOWvooQ7kNvwH5DUpQ&_nc_oc=AdqtoWbpVTmdaSRaANGaI8yvtgEszZk9_vZmHNaU22SwkYsDZRstMwW_10woxZ7DZs8&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=TP-AU5EFloapW0suVJ_Rfg&_nc_ss=7b2a8&oh=00_Af78k7MljtPwrfHXHdbfZhtz0JDwzOj3g39dSJlc9T644Q&oe=69FC50A9',
  'M-26': 'https://tcgplayer-cdn.tcgplayer.com/product/675288_in_800x800.jpg',
  'M-26_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/605194121_1474153621379432_8779704034750370625_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=13d280&_nc_ohc=f_ZOEOxFPg0Q7kNvwEvzqQD&_nc_oc=AdpS3_BXyCx6gCSeliZok97guahGZyXGr_qaY1H1iBojmwbQnD3RXAylDZAafP299XY&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=S7Po1W7Md-X1xOLeBpHTkw&_nc_ss=7b2a8&oh=00_Af6-fbHMB6PaRNboKL22MDWZ5QYGODLyzdMZbg3gSVNcaQ&oe=69FC3E55',
  'M-27': 'https://tcgplayer-cdn.tcgplayer.com/product/675290_in_800x800.jpg',
  'M-27_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/602331778_1474153504712777_7992610762642137550_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=RpSHMz6DpFAQ7kNvwG4N3OD&_nc_oc=AdrmV6cgeUmsLpqVAZDrYwRc_3O4rkYZzrxU3AwlqM0s50o3AxdLu55ogMn9Tw1Qk6Y&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=EytNuVEmTzbRN_pXQPa0YQ&_nc_ss=7b2a8&oh=00_Af6QtpaFVns03T-Dw-ALroIxo-2b0_JJSTSLtfOUen8tFw&oe=69FC66BB',
  'M-28': 'https://tcgplayer-cdn.tcgplayer.com/product/675292_in_800x800.jpg',
  'M-28_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/603837943_1474153534712774_1907519039978580036_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=13d280&_nc_ohc=snbysLetjE0Q7kNvwFt_122&_nc_oc=Ado7e7UHRYTPqQLvyrtD5gCNEYFfrQr2PYe6zq26_abCmDYrx6pJXwmNW-G5P9PADPU&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=q2ESH-rItKvdzcJmcmdcCg&_nc_ss=7b2a8&oh=00_Af745-wwqSxNRQyMZsVt_n0we2vDc-WKho3-cXFjdk9eHw&oe=69FC36DC',
  'M-29': 'https://tcgplayer-cdn.tcgplayer.com/product/675289_in_800x800.jpg',
  'M-29_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/605365093_1474153618046099_5049355382543254289_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=13d280&_nc_ohc=5MNd9bR_7YkQ7kNvwHnGqj6&_nc_oc=AdqEgLTX94fuUwZxRzZhcU0ggVNLqF74j5o4RJYKHzOCVOQORNqkHgBJVX3X02jDx8I&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=aJ6JlRIVgj97BrS7Q6owGA&_nc_ss=7b2a8&oh=00_Af62rICMBj9kcqV-DOvT_PvHpXqYkUx1hST6JACq4O3bWA&oe=69FC492D',
  'M-30': 'https://tcgplayer-cdn.tcgplayer.com/product/675286_in_800x800.jpg',
  'M-30_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/600361892_1474153624712765_738644235200044409_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=13d280&_nc_ohc=nIfX2-WTG0gQ7kNvwE1ahWW&_nc_oc=AdrdGMbcWwzWhxvRsFhPB6aQ0tYwpfveOiHJW8671sOxm62-YZxd7R1bjVaK0qDFwIc&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=fkbcJhtxZrOkUhjMPlfipw&_nc_ss=7b2a8&oh=00_Af6T1GCFkzwVXJBjYZQvBwXtOLbtRV2eKYnONHNOwhorQA&oe=69FC5175',
  'M-31': 'https://tcgplayer-cdn.tcgplayer.com/product/675284_in_800x800.jpg',
  'M-31_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/603879288_1474153508046110_1778760130817078199_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=sc-9eZS6_2AQ7kNvwH7PIaC&_nc_oc=Adom6KoeUVTBRGntEVJDWOceHeQFSCk56bU-hm-YymyPs2kRAge5T2cWn3ZjyhiB3vU&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=GWERwhHAUjVDu2qula10bA&_nc_ss=7b2a8&oh=00_Af5iU-e8RmDIrQEvjqZ2WvqPnwc-tVECMcqCdqJKHIqawQ&oe=69FC6189',
  'M-32': 'https://tcgplayer-cdn.tcgplayer.com/product/675293_in_800x800.jpg',
  'M-32_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/601860527_1474153544712773_1142227952218021625_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=iiX03yHGn40Q7kNvwGb-_-s&_nc_oc=Ado7wh1fo6lp352tA_FPjhvnfYfFGFj6ZXR1O5iCHYg8PTNMiuur6MBQbUhKSAmCV6A&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=-Kb0YP7pfybArndN2U10YA&_nc_ss=7b2a8&oh=00_Af6knWoqH4rpfePt6vpE_VHScGTbTU4uzCoaYpK7DPlLXA&oe=69FC3EC6',
  'M-33': 'https://tcgplayer-cdn.tcgplayer.com/product/675294_in_800x800.jpg',
  'M-33_PR': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/603052313_1474153611379433_6194103944429839731_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=13d280&_nc_ohc=WNFGbxRQNLEQ7kNvwF29NRR&_nc_oc=Adrd-xrk9mkLylxCkayOyXYMziBi4a6bYb9UyMvYh3CAC8grN_Tzzie-RvfI_O2b3IQ&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=48Wxw2BkaQmH5DzOgTXEVA&_nc_ss=7b2a8&oh=00_Af6xPidodZTD7XMHqKBqThqoUfGPnUfENF6xltYydnkNBA&oe=69FC486F',
  'M-34': 'https://tcgplayer-cdn.tcgplayer.com/product/656436_in_800x800.jpg',
  'M-35': 'https://tcgplayer-cdn.tcgplayer.com/product/656437_in_800x800.jpg',
  'M-36': 'https://tcgplayer-cdn.tcgplayer.com/product/668716_in_800x800.jpg',
  'M-37': 'https://tcgplayer-cdn.tcgplayer.com/product/668717_in_800x800.jpg',
  'M-38': 'https://tcgplayer-cdn.tcgplayer.com/product/668728_in_800x800.jpg',
  'M-39': 'https://tcgplayer-cdn.tcgplayer.com/product/668729_in_800x800.jpg',
  'M-40': 'https://tcgplayer-cdn.tcgplayer.com/product/668730_in_800x800.jpg',
  'M-41': 'https://tcgplayer-cdn.tcgplayer.com/product/668732_in_800x800.jpg',
  'M-42': 'https://tcgplayer-cdn.tcgplayer.com/product/668733_in_800x800.jpg',
  'M-43': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3xdImjroZIkU4oQpzK1Se4wLAF7-Ugf71IQ&s',
  'M-44': 'https://pbs.twimg.com/media/G8-p-dTbMAEVE2l.jpg',
  'M-45': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645429008_1538228961638564_7827175028145514808_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=nUrbpzRNBakQ7kNvwHsT_6o&_nc_oc=AdreCz8P-5jmGleFMsbFX1Svv6gm2VFLOv004g5eDEGFvIa4D7ul2coTCZinBASsEh8&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=FMSITF8EZ7heTdf2XkuAcQ&_nc_ss=7b2a8&oh=00_Af7dha-i429XRXRqRML9UGO4_QewqruP6LQ9Cv60GRYVaA&oe=69FC3F4F',
  'M-46': 'https://cardboyz.com/cdn/shop/files/42BB6A4E-7B46-46D8-AC91-AD0273A72CE7_533x.jpg?v=1777314311',
  'M-47': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645349754_1538228931638567_7772155806316174624_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=13d280&_nc_ohc=42LmiefTaRIQ7kNvwHUsAX_&_nc_oc=AdoDzbwEZuKk4zUPThUimrkF19QMLFAMEdLr0c0Qu6EFV-U_Y2bJnAeQWUrbu3L48K0&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=XGu-8WcS3FD8I-f0D5FaVw&_nc_ss=7b2a8&oh=00_Af6Z2LhLp4ASfn4ScIS8dHlZMDMJB-ymPdVbjiqLOsXGHA&oe=69FC58FA',
  'M-48': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645338433_1538229114971882_5471819768281296028_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=jKGBbX7CKE8Q7kNvwHOH_yR&_nc_oc=AdpO34xtURBbtNmIH4BK0PiAJ76FPHugzE4qh7KcdoXNwdC3YM3XTjO0YXRJHZkYhFA&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=tGupA-paH909suyreKAiWg&_nc_ss=7b2a8&oh=00_Af5wH7ReJqmGIEyTdd0vOkfECW211kiuhGBJWVSSIbsrFQ&oe=69FC4FEF',
  'M-49': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/646975636_1538229014971892_5454497725362055126_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=13d280&_nc_ohc=NszBSUlHv74Q7kNvwGEr338&_nc_oc=Adrnxlf5c3XU0KKi5l1gGVu1L9WJc8L86gVIKMLlC0LUh-83ayE0uNS_Fd6zNP4gkoE&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=JAi2l6gdhf6vEWZQB7Xk3w&_nc_ss=7b2a8&oh=00_Af7bot9thWCDHdE6_QApAJprSV8Lva49BxRzPZ4hg1TjCQ&oe=69FC2FC4',
  'M-50': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645438228_1538229108305216_5405045373254784936_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=13d280&_nc_ohc=OBFr_W06mKIQ7kNvwHPnSH4&_nc_oc=AdquTPwpJMfvwtWIK04uFK8a6cr6-c4aZ5uxVGUUoOigcjhocRYQ_3Kd9TDV5emR7Ik&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=T7gGt-61u2k7z9r3H5ZJbA&_nc_ss=7b2a8&oh=00_Af4ifTRi1k5AbWoBHfOVvw0fh_JIGPxLgtzgRcgW5sQG-Q&oe=69FC4690',
  'M-51': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/628977303_1538229118305215_535128533428282175_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=108&ccb=1-7&_nc_sid=13d280&_nc_ohc=JKU2P8kbsUEQ7kNvwHacEtA&_nc_oc=AdrcnU62p1n4KE9su3Y6mRhdaXuqdyhT-5Vqs9NKlt6h09LIBP8ZKPLlvJpEIklAlmM&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=I3gXHWbwLlE1Jx1GjjBb6w&_nc_ss=7b2a8&oh=00_Af5ZV5kLz9DjJd2quSkH7WIH-JBjNwF0UrSNl7b2AiGHyw&oe=69FC3C5C',
  'M-52': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645447152_1538229028305224_90046133820223342_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=33fuO3mMmGAQ7kNvwF7ZZok&_nc_oc=Adoi2FMhmXVEEOzlG154pOE1tND7g0B3xHLN-1E_pVQJ5muTbwrCmvvtWYD8J3YGHRc&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=1a-7psL1eg76LfSrAT9cpw&_nc_ss=7b2a8&oh=00_Af4wiBQlwzW-dl4FNvppVh6X3Da5F2QpcwczQqhchuSbjA&oe=69FC365C',
  'M-53': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645092803_1538228958305231_5998087925425689339_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=109&ccb=1-7&_nc_sid=13d280&_nc_ohc=mfw2G6Y3OPkQ7kNvwErEB9G&_nc_oc=AdrRLV6BiCabBXDJWsxAc-UKnfzhCTgSYFu89b-XCLz3tQgTeL6hWDAODbXYx2-V-G8&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=c1hmMsugxbOVH6ZE7J-vWQ&_nc_ss=7b2a8&oh=00_Af7OnmcGqNQCc792LwJYtxOC1euHv_Hnk1JJw5zu1crROQ&oe=69FC4540',
  'M-54': 'https://scontent-bcn1-1.xx.fbcdn.net/v/t39.30808-6/645425553_1538228984971895_2358279827002329545_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=rVzGu7M_qTMQ7kNvwFOMG2K&_nc_oc=Adqxntfv3Lo30G3eRqabX_D9JJaswQhlVOvBk4Cfpc2fimT03iKY12hf2cPPc8jasd8&_nc_zt=23&_nc_ht=scontent-bcn1-1.xx&_nc_gid=VCsgpQ0h0CZ-rwDP6UiltQ&_nc_ss=7b2a8&oh=00_Af4CyK8Ny3pTzpRew_ViZm5oRbH3Sue8yZckA3c9T1qvlQ&oe=69FC4ED5',
  'PM01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/11/19/VqCUMN4dxFjbIcp6/thumbnail_en.webp',
  'PM02': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2024/09/03/h5ChG0qML4QTah6S/FW_DB40th_PlayMat_dummy_s.png',
  'SL04': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2026/01/21/IeDlRDboddQ4vqy1/thumbnail.png',
  'SL-ILL': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/07/15/5tfav6uAZ6OTsLyL/thumbnail.png',
  'SL-ILL-SP': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/09/30/VpkKmgawLxxAM1sp/thumbnail.png',
  'SL01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/31/xQfxsXaOgDB8va5d/sleeve.png',
  'SL-LTD03-BULMA': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/18/U5AFzLqhvaxCHh8a/thumbnail.png',
  'SL-LTD04-GOKU': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/06/18/NNeMLJVYa4xUyLus/thumbnail.png',
  'SL03': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2025/05/08/he4GN6a9tDlsY9G2/thumbnail.png',
  'SL02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/10/03/0J6RzvOEaa68mXHb/sleeve02.png',
  'SL-LTD02-GOKU': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/25/UbHawtxNemzYvFZg/sleeves_limited02.png',
  'SL-LTD02-SHENRON': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/25/Khbw3O3Crkag45xW/sleeves_limited01.png',
  'CC-BARDOCK': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/EwzftqLxABcsbbzQ/set.png',
  'CC-BROLY': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/03/11/hdrXCKyfx6JN1Xey/FW_broly_dummy_s1.png?_=',
  'CC-VEGITO': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/01/10/lZ4yDQQaG7k7NVkx/FW_vegetto_cardcase_dummy_s1.png?_=',
  'CC-GOGETA': 'https://www.dbs-cardgame.com/fw/bccard/jp/news/2025/01/10/FQxr1BG8NVADGhcf/FW_gogeta_cardcase_dummy_s1.png?_=',
  'ACS02': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/Q95wCMSqaTSlZjKf/set.png',
  'ACS01': 'https://www.dbs-cardgame.com/fw/bccard/en/news/2024/07/09/SO7IRc932UC2usKA/set.png',
};

const LEGAL_STATUS_MAP: Record<string, { status: 'Banned' | 'Limited' | 'Errata'; date?: string }> = {
  'BT1-005': { status: 'Banned', date: '31 de marzo de 2023' },
  'BT1-010': { status: 'Errata' },
  'BT1-052': { status: 'Banned' },
  'BT1-083': { status: 'Banned' },
  'BT1-108': { status: 'Banned' },
  'BT1-053': { status: 'Errata' },
  'BT23-016': { status: 'Limited' },
  'BT23-109': { status: 'Limited' },
  'BT23-103': { status: 'Limited' },
  'BT10-075': { status: 'Limited' },
  'BT20-096': { status: 'Limited' },
  'BT13-034': { status: 'Limited' },
  'BT10-008': { status: 'Limited' },
  'P-308': { status: 'Limited' },
  'BT13-120': { status: 'Limited' },
  'BT12-045': { status: 'Limited' },
  'BT12-022': { status: 'Limited' },
  'TB1-052': { status: 'Limited' },
  'BT10-130': { status: 'Limited' },
  'BT1-107': { status: 'Limited' },
  'BT2-044': { status: 'Banned' },
  'BT2-067': { status: 'Banned' },
  'BT2-086': { status: 'Limited' },
  'BT3-032': { status: 'Banned' },
  'BT3-100': { status: 'Banned' },
  'BT3-112': { status: 'Banned' },
  'BT3-118': { status: 'Banned' },
  'BT28-123': { status: 'Errata' },
  'BT4-045': { status: 'Banned' },
  'BT4-073': { status: 'Banned' },
  'BT4-122': { status: 'Banned' },
  'BT27-124': { status: 'Errata' },
  'BT5-038': { status: 'Banned' },
  'BT5-118': { status: 'Banned' },
  'P-642': { status: 'Errata' },
  'BT6-111': { status: 'Banned' },
  'BT6-112': { status: 'Banned' },
  'BT25-001': { status: 'Errata' },
  'BT26-097': { status: 'Errata' },
  'BT26-098': { status: 'Errata' },
  'BT26-119': { status: 'Errata' },
  'BT25-070': { status: 'Errata' },
  'BT10-055': { status: 'Errata' },
  'P-549': { status: 'Errata' },
  'BT24-096': { status: 'Errata' },
  'BT21-097': { status: 'Errata' },
  'BT19-055': { status: 'Errata' },
  'BT20-086': { status: 'Errata' },
  'BT24-043': { status: 'Errata' },
  'P-566': { status: 'Errata' },
  'BT19-140': { status: 'Errata' },
  'BT23-033': { status: 'Errata' },
  'P-543': { status: 'Errata' },
  'P-548': { status: 'Errata' },
  'EX23-50': { status: 'Errata' },
  'BT22-113': { status: 'Errata' },
  'BT21-091': { status: 'Errata' },
  'BT22-001': { status: 'Errata' },
  'BT22-086': { status: 'Errata' },
  'BT22-124': { status: 'Errata' },
  'BT22-125': { status: 'Errata' },
  'BT22-126': { status: 'Errata' },
  'BT22-137': { status: 'Errata' },
  'BT21-096': { status: 'Errata' },
  'BT21-024': { status: 'Errata' },
  'BT21-099': { status: 'Errata' },
  'P-500': { status: 'Errata' },
  'BT21-035': { status: 'Errata' },
  'BT21-036': { status: 'Errata' },
  'BT21-068': { status: 'Errata' },
  'BT21-070': { status: 'Errata' },
  'BT21-078': { status: 'Errata' },
  'BT21-081': { status: 'Errata' },
  'BT21-088': { status: 'Errata' },
  'BT21-103': { status: 'Errata' },
  'BT21-137': { status: 'Errata' },
  'BT21-145': { status: 'Errata' },
  'BT21-149': { status: 'Errata' },
  'P-506': { status: 'Errata' },
  'P-513': { status: 'Errata' },
  'P-493': { status: 'Errata' },
  'BT20-024': { status: 'Errata' },
  'BT20-101': { status: 'Errata' },
  'BT20-099': { status: 'Errata' },
  'BT19-019': { status: 'Errata' },
  'BT19-045': { status: 'Errata' },
  'BT19-105': { status: 'Errata' },
  'P-434': { status: 'Errata' },
  'BT11-030': { status: 'Errata' },
  'BT18-052': { status: 'Errata' },
  'EX13-04': { status: 'Errata' },
  'P-177': { status: 'Errata' },
  'P-417': { status: 'Errata' },
  'BT18-089': { status: 'Errata' },
  'BT8-089': { status: 'Errata' },
  'SD14-01': { status: 'Errata' },
  'P-211': { status: 'Errata' },
  'P-394': { status: 'Errata' },
  'BT12-082': { status: 'Errata' },
  'P-398': { status: 'Errata' },
  'DB2-030': { status: 'Errata' },
  'BT7-072': { status: 'Errata' },
  'BT9-101': { status: 'Errata' },
  'BT14-087': { status: 'Errata' },
  'BT14-140': { status: 'Errata' },
  'P-360': { status: 'Errata' },
  'BT16-098': { status: 'Errata' },
  'BT13-124': { status: 'Errata' },
  'BT12-128': { status: 'Errata' },
  'BT11-091': { status: 'Errata' },
  'BT15-057': { status: 'Errata' },
  'P-337': { status: 'Errata' },
  'BT13-060': { status: 'Errata' },
  'BT15-066': { status: 'Errata' },
  'BT15-068': { status: 'Errata' },
  'BT15-069': { status: 'Errata' },
  'BT15-088': { status: 'Errata' },
  'BT15-089': { status: 'Errata' },
  'BT11-028': { status: 'Errata' },
  'BT11-058': { status: 'Errata' },
  'BT11-133': { status: 'Errata' },
  'BT11-134': { status: 'Errata' },
  'BT11-135': { status: 'Errata' },
  'BT13-028': { status: 'Errata' },
  'BT14-061': { status: 'Errata' },
  'BT9-137': { status: 'Errata' },
  'BT11-088': { status: 'Errata' },
  'BT11-122': { status: 'Errata' },
  'BT9-111': { status: 'Errata' },
  'BT13-139': { status: 'Errata' },
  'EB1-26': { status: 'Errata' },
  'BT11-064': { status: 'Errata' },
  'BT9-076': { status: 'Errata' },
  'P-250': { status: 'Errata' },
  'BT10-153': { status: 'Errata' },
  'BT10-036': { status: 'Errata' },
  'BT10-040': { status: 'Errata' },
  'BT10-144': { status: 'Errata' },
  'BT2-036': { status: 'Errata' },
  'BT10-034': { status: 'Errata' },
  'BT8-053': { status: 'Banned' },
  'BT8-070': { status: 'Banned' },
  'BT9-128': { status: 'Banned' },
  'BT9-050': { status: 'Banned' },
  'BT9-112': { status: 'Banned' },
  'BT10-003': { status: 'Banned' },
  'BT10-011': { status: 'Banned' },
  'BT10-027': { status: 'Banned' },
  'BT10-044': { status: 'Banned' },
  'BT10-097': { status: 'Banned' },
  'BT10-117': { status: 'Banned' },
  'BT10-127': { status: 'Banned' },
  'BT10-128': { status: 'Banned' },
  'BT12-023': { status: 'Banned' },
  'BT16-020': { status: 'Banned' },
  'BT17-032': { status: 'Banned' },
  'BT18-001': { status: 'Banned' },
  'BT18-002': { status: 'Banned' },
  'BT18-011': { status: 'Banned' },
  'BT18-019': { status: 'Banned' },
  'BT18-022': { status: 'Banned' },
  'BT20-029': { status: 'Banned' },
  'BT21-074': { status: 'Banned' },
  'DB2-062': { status: 'Banned' },
  'DB2-104': { status: 'Banned' },
  'DB2-108': { status: 'Banned' },
  'DB2-137': { status: 'Banned' },
  'DB2-140': { status: 'Banned' },
  'DB2-151': { status: 'Banned' },
  'DB2-153': { status: 'Banned' },
  'DB3-015': { status: 'Banned' },
  'EX03-27': { status: 'Banned' },
  'EX06-14': { status: 'Banned' },
  'EX06-27': { status: 'Banned' },
  'EX07-02': { status: 'Banned' },
  'EX10-02': { status: 'Banned' },
  'EX13-35': { status: 'Banned' },
  'EX16-03': { status: 'Banned' },
  'P-167': { status: 'Banned' },
  'P-261': { status: 'Banned' },
  'P-262': { status: 'Banned' },
  'P-265': { status: 'Banned' },
  'P-285': { status: 'Banned' },
  'SD16-03': { status: 'Banned' },
  'TB2-012': { status: 'Banned' },
  'TB2-027': { status: 'Banned' },
  'TB3-065': { status: 'Banned' },
  'BT10-038': { status: 'Errata' },
  'EX09-03': { status: 'Errata' },
  'EX10-03': { status: 'Errata' },
  'BT9-039': { status: 'Errata' },
  'P-092': { status: 'Errata' },
  'BT5-119': { status: 'Errata' },
  'TB3-046': { status: 'Errata' },
  'TB3-064': { status: 'Errata' },
  'BT8-110': { status: 'Banned' },
  'BT8-114': { status: 'Errata' },
  'BT8-122': { status: 'Banned' },
  'XD2-09': { status: 'Errata' },
  'BT7-125': { status: 'Errata' },
  'BT7-126': { status: 'Errata' },
  'BT7-127': { status: 'Errata' },
  'BT7-128': { status: 'Errata' },
  'BT7-129': { status: 'Errata' },
  'EX06-18': { status: 'Errata' },
  'P-144': { status: 'Errata' },
  'BT5-104': { status: 'Errata' },
  'BT6-106': { status: 'Errata' },
  'BT1-081': { status: 'Errata' },
  'BT4-003': { status: 'Errata' },
  'TB3-062': { status: 'Errata' },
  'P-073': { status: 'Errata' },
  'P-075': { status: 'Errata' },
  'BT5-120': { status: 'Errata' },
  'BT5-097': { status: 'Errata' },
  'BT5-080': { status: 'Errata' },
  'TB2-008': { status: 'Errata' },
  'EX03-16': { status: 'Errata' },
  'BT4-108': { status: 'Errata' },
  'P-028': { status: 'Errata' },
  'BT3-070': { status: 'Errata' },
  'BT3-044': { status: 'Errata' },
  'BT2-022': { status: 'Errata' },
  'BT1-100': { status: 'Errata' },
  'BT1-069': { status: 'Errata' },
  'BT1-045': { status: 'Errata' },
  'BT2-055': { status: 'Errata' },
  'BT2-047': { status: 'Errata' },
  'P-020': { status: 'Errata' },
  'P-018': { status: 'Errata' },
  'BT2-081': { status: 'Errata' },
  'BT2-065': { status: 'Errata' },
  'BT2-015': { status: 'Errata' },
  'BT2-003': { status: 'Errata' },
  'BT1-061': { status: 'Errata' }
};

const CHANGELOG = [
  {
    version: '5.0.2',
    date: '15 de mayo de 2026',
    changes: [
      { es: 'Nuevo tutorial interactivo para ayudar a los nuevos usuarios a familiarizarse con la app.', en: 'New interactive tutorial to help new users familiarize themselves with the app.' },
      { es: 'Añadidos Empty States visuales cuando no hay cartas en la colección o al buscar.', en: 'Added visual Empty States when there are no cards in the collection or searching.' }
    ]
  },
  {
    version: '5.0.1',
    date: '15 de mayo de 2026',
    changes: [
      { es: 'Añadido botón de donaciones en el perfil para apoyar el proyecto mediante Ko-fi.', en: 'Added donation button in profile to support the project via Ko-fi.' },
      { es: 'Raffinada la lógica de filtros y opciones de versiones alternativas separando Fusion World y Masters.', en: 'Refined filtering logic and alternative versions choices separating Fusion World and Masters.' },
      { es: 'Corregida la etiqueta de secciones de color en el menú de filtros.', en: 'Fixed color section label in the filters menu.' }
    ]
  },
  {
    version: '5.0.0',
    date: '14 de mayo de 2026',
    changes: [
      { es: '¡Hito alcanzado! Catálogo de Fusion World completado al 100%.', en: 'Milestone reached! Fusion World catalog 100% complete.' },
      { es: 'Lanzamiento de la versión mayor 5.0.0 con todas las colecciones y variantes registradas.', en: 'Major version 5.0.0 launch with all collections and variants registered.' }
    ]
  },
  {
    version: '4.6.0',
    date: '13 de mayo de 2026',
    changes: [
      { es: 'Implementado el sistema avanzado de origen de cartas con navegación inteligente al pack/set correspondiente.', en: 'Implemented advanced card origin system with smart navigation to the corresponding pack/set.' },
      { es: 'Mejorada la navegación en la sección de Colección, mostrando nombres descriptivos en lugar de identificadores técnicos.', en: 'Improved navigation in the Collection section, showing descriptive names instead of technical identifiers.' },
      { es: 'Añadida la subcategoría "Winner Release Event FB02" a Promos.', en: 'Added "Winner Release Event FB02" subcategory to Promos.' }
    ]
  },
  {
    version: '4.5.0',
    date: '13 de mayo de 2026',
    changes: [
      { es: 'Nueva categoría "Ultimate Battle" añadida con subcategorías por años.', en: 'New "Ultimate Battle" category added with subcategories by year.' },
      { es: 'Añadidas las cartas de Ultimate Battle 2024 Vol.1 (Winner y Top 8).', en: 'Added Ultimate Battle 2024 Vol.1 cards (Winner and Top 8).' },
      { es: 'Mejorado el sistema de origen de las cartas para permitir navegación directa al pack correspondiente.', en: 'Improved card origin system to allow direct navigation to the corresponding pack.' }
    ]
  },
  {
    version: '4.4.0',
    date: '13 de mayo de 2026',
    changes: [
      { es: 'Añadidas las cartas del Tournament Pack 02 (Normal y Winner) a Fusion World.', en: 'Added Tournament Pack 02 cards (Normal and Winner) to Fusion World.' },
      { es: 'Movida la carta de Ganador de Son Gohan (Release Event FB02) a la categoría de Promos.', en: 'Moved Son Gohan Winner card (Release Event FB02) to the Promos category.' },
      { es: 'Mejorada la visualización del origen de obtención en el detalle de las cartas (Tournament, Championship, Playmat, Anniversary).', en: 'Improved display of card origin in card details (Tournament, Championship, Playmat, Anniversary).' }
    ]
  },
  {
    version: '4.3.0',
    date: '13 de mayo de 2026',
    changes: [
      { es: 'Añadidas nuevas categorías a Fusion World: Sleeves, Premium Card Collection, Cases, Serial Cards y Accessories.', en: 'Added new categories to Fusion World: Sleeves, Premium Card Collection, Cases, Serial Cards, and Accessories.' },
      { es: 'Actualizados los fondos de las categorías principales con imágenes de producto en alta calidad.', en: 'Updated main category backgrounds with high-quality product images.' },
      { es: 'Corregidas las imágenes de las Premium Card Collection 01 y 02 con las versiones oficiales correctas.', en: 'Fixed images for Premium Card Collection 01 and 02 with the correct official versions.' },
      { es: 'Base de datos de Fusion World actualizada con las últimas cartas reveladas.', en: 'Fusion World database updated with the latest revealed cards.' }
    ]
  },
  {
    version: '4.2.1',
    date: '9 de mayo de 2026',
    changes: [
      { es: 'Optimizaciones críticas de Firestore para reducir el consumo de cuota de lectura.', en: 'Critical Firestore optimizations to reduce read quota consumption.' },
      { es: 'Implementado sistema de caché persistente (IndexedDB) para mejorar la velocidad y ahorrar datos.', en: 'Implemented persistent cache (IndexedDB) to improve speed and save data.' },
      { es: 'Denormalización de estadísticas de usuario para un ranking más eficiente.', en: 'User stats denormalization for more efficient rankings.' }
    ]
  },
  {
    version: '4.2.0',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Implementado filtro de propiedad (Tengo / No tengo) en todas las vistas.', en: 'Implemented ownership filter (Owned / Not Owned) across all views.' },
      { es: 'Optimización de filtros en la pestaña de búsqueda.', en: 'Filter optimization in the search tab.' }
    ]
  },
  {
    version: '4.1.11',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Implementado formato apaisado (landscape) especial para Playmats en todas las vistas.', en: 'Implemented special landscape format for Playmats across all views.' },
      { es: 'Añadidos los Playmats oficiales a la base de datos de cartas.', en: 'Added official Playmats to the card database.' }
    ]
  },
  {
    version: '4.1.10',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Actualizada la imagen del Playmat 40th Anniversary y optimizada la navegación de Playmats.', en: 'Updated 40th Anniversary Playmat image and optimized Playmats navigation.' },
      { es: 'Acceso directo al listado de Playmats habilitado desde el menú principal.', en: 'Direct access to Playmats list enabled from the main menu.' }
    ]
  },
  {
    version: '4.1.9',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Añadido el nuevo Playmat oficial del 40 aniversario (40th Anniversary ver.) y habilitada la categoría de Playmats.', en: 'Added the new official 40th Anniversary Playmat and enabled the Playmats category.' }
    ]
  },
  {
    version: '4.1.8',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Nuevas imágenes de fondo para las expansiones ST01 (Starter Deck) y FB10 (Ultimate Squad).', en: 'New background images for ST01 (Starter Deck) and FB10 (Ultimate Squad) expansions.' }
    ]
  },
  {
    version: '4.1.7',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Añadidas ilustraciones para cartas promocionales FB06, FB07 y FB08 en Fusion World.', en: 'Added artworks for FB06, FB07, and FB08 promotional cards in Fusion World.' },
      { es: 'Nuevos enlaces directos para variantes de Goku Black, Kefla y Son Goku (Ultra Instinct).', en: 'New direct links for Goku Black, Kefla, and Son Goku (Ultra Instinct) variants.' }
    ]
  },
  {
    version: '4.1.6',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Actualizadas múltiples ilustraciones de cartas promocionales FB05 en Fusion World.', en: 'Updated multiple FB05 promotional card artworks in Fusion World.' },
      { es: 'Corregidos enlaces de imágenes para variantes específicas de Goku, Vegeta y otros líderes.', en: 'Fixed image links for specific variants of Goku, Vegeta, and other leaders.' }
    ]
  },
  {
    version: '4.1.5',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Optimizado el acceso a Box en Fusion World: ahora redirige directamente al listado.', en: 'Optimized access to Box in Fusion World: now redirects directly to the list.' },
      { es: 'Ajustes finales en la lógica de Energy Markers y sus imágenes predeterminadas.', en: 'Final adjustments to Energy Markers logic and their default images.' }
    ]
  },
  {
    version: '4.1.4',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Añadidos Energy Markers de Fusion World (E01, E02, E03) y múltiples versiones alternativas.', en: 'Added Fusion World Energy Markers (E01, E02, E03) and multiple alternative versions.' },
      { es: 'Implementada imagen de reserva (fallback) para Energy Markers en Fusion y Masters.', en: 'Implemented fallback image for Energy Markers in Fusion and Masters.' },
      { es: 'Actualizadas imágenes especiales para marcadores de eventos y promocionales.', en: 'Updated special images for event and promotional markers.' }
    ]
  },
  {
    version: '4.1.3',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Activada la categoría de Energy Markers en la sección de Fusion World.', en: 'Activated the Energy Markers category in the Fusion World section.' },
      { es: 'Listado completo de Energy Markers disponibles (E01-01 a E-142) con versiones alternativas ya accesible.', en: 'Full list of available Energy Markers (E01-01 to E-142) with alternative versions now accessible.' }
    ]
  },
  {
    version: '4.1.1',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Corregida la ruta de la imagen para la carta promocional FB01-049_A_FB03, asegurando que se muestre la versión correcta (p3).', en: 'Fixed the image path for celebratory card FB01-049_A_FB03, ensuring the correct version (p3) is displayed.' },
      { es: 'Revisiones aplicadas a las URLs de los banners de los sets FB05 a FB08 para mejorar la fiabilidad de carga.', en: 'Applied revisions to the banner URLs for sets FB05 to FB08 to improve loading reliability.' },
      { es: 'Ajustada la lógica de sufijos para todas las reimpresiones de Fusion World.', en: 'Adjusted suffix logic for all Fusion World reprints.' }
    ]
  },
  {
    version: '4.1.0',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Mejorada la lógica de carga de imágenes para Fusion World, garantizando que todas las versiones promocionales y reimpresiones se muestren correctamente mediante un sistema de overrides unificado.', en: 'Improved image loading logic for Fusion World, ensuring all promotional and reprint versions display correctly via a unified overrides system.' },
      { es: 'Añadido soporte para nuevas imágenes de alta calidad de Energy Markers y verificada la integración con TCGPlayer.', en: 'Added support for new high-quality Energy Marker images and verified TCGPlayer integration.' },
      { es: 'Mejoras de estabilidad general en el mapeo de imágenes de cartas para las colecciones Masters y Fusion World.', en: 'General stability improvements in card image mapping for both Masters and Fusion World collections.' }
    ]
  },
  {
    version: '4.0.0',
    date: '7 de mayo de 2026',
    changes: [
      { es: '¡Lanzamiento oficial de Dragon Ball Super Card Game Fusion World para todos los usuarios!', en: 'Official release of Dragon Ball Super Card Game Fusion World for all users!' },
      { es: 'Nuevo selector de juego al inicio: elige entre Masters y Fusion World cada día.', en: 'New game selector on startup: choose between Masters and Fusion World every day.' },
      { es: 'Liberada la colección de Fusion World (anteriormente en fase de pruebas).', en: 'Released Fusion World collection (previously in testing phase).' }
    ]
  },
  {
    version: '3.3.4',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Modificados los filtros para permitir la selección múltiple de rarezas simultáneamente.', en: 'Modified filters to allow multiple rarity selections simultaneously.' }
    ]
  },
  {
    version: '3.3.3',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Desactivado el menú contextual nativo en móviles para mejorar la experiencia de selección múltiple al mantener pulsado.', en: 'Disabled native context menu on mobile to improve long-press multi-select experience.' }
    ]
  },
  {
    version: '3.3.2',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Optimizado el tiempo de respuesta de la pulsación larga (500ms) y eliminada la necesidad de mover el cursor para activar la selección.', en: 'Optimized long-press response time (500ms) and removed the need to move the cursor to activate selection.' }
    ]
  },
  {
    version: '3.3.1',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Refinada la visualización en selección múltiple: las cartas no obtenidas permanecen en blanco y negro si no están seleccionadas para facilitar la identificación de faltantes.', en: 'Refined multi-select visualization: unowned cards stay in black and white if not selected to make missing ones easier to spot.' }
    ]
  },
  {
    version: '3.3.0',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Implementado sistema de selección múltiple manteniendo pulsada una carta.', en: 'Implemented multi-selection system by long-pressing a card.' },
      { es: 'Añadida barra de acciones masivas para actualizar inventario en lote.', en: 'Added bulk action bar for batch inventory updates.' },
      { es: 'Permite seleccionar cantidad masiva en el modo de perfil jugador.', en: 'Allows bulk quantity selection in player profile mode.' }
    ]
  },
  {
    version: '3.2.6',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Corregido el conteo total de cartas Leader Rare (_SLR) en las estadísticas.', en: 'Fixed total count of Leader Rare cards (_SLR) in statistics.' },
      { es: 'Actualizada la lógica de cartas alternativas para incluir SLR como base.', en: 'Updated alternative card logic to include SLR as base.' }
    ]
  },
  {
    version: '3.2.5',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Traducción de los nombres de colores en estadísticas y filtros.', en: 'Translation of color names in statistics and filters.' },
      { es: 'Corregido el conteo de estadísticas para cartas Leader Rare (_SLR).', en: 'Fixed statistics counting for Leader Rare cards (_SLR).' },
      { es: 'Eliminada la rareza inexistente EP12 de las estadísticas.', en: 'Removed non-existent rarity EP12 from statistics.' }
    ]
  },
  {
    version: '3.2.4',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Eliminada la carta duplicada EX13-30_PR del catálogo.', en: 'Removed duplicate card EX13-30_PR from the catalog.' }
    ]
  },
  {
    version: '3.2.3',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Sincronización persistente de preferencias (idioma y tipo de coleccionista) en la nube: ahora tus ajustes se mantienen entre dispositivos y sesiones al iniciar sesión.', en: 'Persistent cloud synchronization of preferences (language and collector type): your settings now remain consistent across devices and sessions when logging in.' },
      { es: 'Optimización del flujo de onboarding para evitar repeticiones innecesarias.', en: 'Optimized onboarding flow to avoid unnecessary repetitions.' }
    ]
  },
  {
    version: '3.2.2',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Migración masiva de imágenes de fondo al directorio local (/public) para garantizar su correcta visualización.', en: 'Mass migration of background images to the local directory (/public) to guarantee correct display.' },
      { es: 'Normalizados nombres de archivos (eliminando espacios) para mayor compatibilidad con navegadores.', en: 'Normalized filenames (removing spaces) for better browser compatibility.' }
    ]
  },
  {
    version: '3.2.1',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Corregida la consistencia del número de versión en la interfaz y el sistema de actualización.', en: 'Fixed version number consistency in the UI and update system.' }
    ]
  },
  {
    version: '3.2.0',
    date: '5 de mayo de 2026',
    changes: [
      { es: 'Añadidas imágenes de fondo personalizadas para todos los Starter Decks (SD1-SD23) y Expert Decks (XD1-XD3).', en: 'Added custom background images for all Starter Decks (SD1-SD23) and Expert Decks (XD1-XD3).' },
      { es: 'Incorporadas ilustraciones temáticas para las categorías de coleccionismo: Merit Cards, Energy Markers, Serial Cards y Tokens.', en: 'Incorporated thematic illustrations for collectible categories: Merit Cards, Energy Markers, Serial Cards, and Tokens.' },
      { es: 'Ajustada la posición de los fondos (60%) para una mejor visibilidad del arte en dispositivos móviles y escritorio.', en: 'Adjusted background position (60%) for better artwork visibility on mobile and desktop devices.' }
    ]
  },
  {
    version: '3.1.0',
    date: '4 de mayo de 2026',
    changes: [
      { es: 'La aplicación ha sido renombrada oficialmente a DBSCG Masters Tracker.', en: 'The application has been officially renamed to DBSCG Masters Tracker.' },
      { es: 'Limpieza masiva de cartas promocionales duplicadas e incorrectas en la sección Promos.', en: 'Massive cleanup of duplicate and incorrect promotional cards in the Promos section.' },
      { es: 'Añadidas imágenes de alta calidad para las promos P-514, P-515, P-516 y el rango P-588 a P-592.', en: 'Added high-quality images for promos P-514, P-515, P-516 and the range P-588 to P-592.' },
      { es: 'Eliminados rangos de cartas promocionales que aún no han sido lanzadas para mantener la integridad de los datos.', en: 'Removed promotional card ranges that have not yet been released to maintain data integrity.' }
    ]
  },
  {
    version: '3.0.0',
    date: '2 de mayo de 2026',
    changes: [
      { es: 'Versión 3.0.0 establecida tras la reestructuración completa y correcta inclusión de las versiones promocionales (Event Packs y Judge Packs) integradas numéricamente junto a sus versiones base dentro de cada set, eliminando duplicados.', en: 'Version 3.0.0 established after the complete restructuring and correct inclusion of promotional versions (Event Packs and Judge Packs) numerically integrated next to their base versions within each set, eliminating duplicates.' }
    ]
  },
  {
    version: '2.9.8',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Actualizadas las imágenes de los ENERGY MARKERS con URLs de alta calidad de TCGPlayer.', en: 'Updated ENERGY MARKERS images with high-quality URLs from TCGPlayer.' }
    ]
  },
  {
    version: '2.9.7',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Nueva categoría de coleccionismo: ENERGY MARKERS. Incluye listado completo M-01 a M-53 con sus imágenes correspondientes.', en: 'New collection category: ENERGY MARKERS. Includes complete list M-01 to M-53 with corresponding images.' }
    ]
  },
  {
    version: '2.9.6',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Reducido el tamaño de fuente de los títulos de los sets para un diseño más estilizado y compacto.', en: 'Reduced set title font size for a more stylized and compact design.' }
    ]
  },
  {
    version: '2.9.5',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Mejorada la interfaz de las categorías: nombres de sets siempre alineados a la izquierda y eliminación de subtítulos redundantes.', en: 'Improved category interface: set names always left-aligned and removal of redundant subtitles.' }
    ]
  },
  {
    version: '2.9.4',
    date: '30 de abril de 2026',
    changes: [
      { es: 'El aviso a la comunidad ahora se muestra una vez por semana. Mejoras en la navegación y scroll del modal en dispositivos móviles.', en: 'Community notice now appears once a week. Improved modal navigation and scrolling on mobile devices.' }
    ]
  },
  {
    version: '2.9.3',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Corregida la alineación de los nombres de los sets (siempre a la izquierda) y eliminados los subtítulos redundantes en las listas de expansiones.', en: 'Fixed set names alignment (always left-aligned) and removed redundant sub-titles in expansion lists.' }
    ]
  },
  {
    version: '2.9.2',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Eliminadas las cartas con el sufijo genérico _JP que estaban duplicadas respecto a sus versiones en Judge Packs específicos (ej. _JP07).', en: 'Removed cards with the generic _JP suffix that were duplicates of their specific Judge Pack versions (e.g. _JP07).' }
    ]
  },
  {
    version: '2.9.1',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Eliminadas las cartas con el sufijo genérico _EP que estaban duplicadas respecto a sus versiones en Event Packs específicos (ej. _EP03).', en: 'Removed cards with the generic _EP suffix that were duplicates of their specific Event Pack versions (e.g. _EP03).' },
      { es: 'Añadida navegación directa haciendo click en el apartado "Incluida en el set" del detalle de cada carta.', en: 'Added direct navigation by clicking the "Included in set" section in the card detail modal.' }
    ]
  },
  {
    version: '2.9.0',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Añadidas Merit Cards como nueva categoría de coleccionismo: 22 cartas exclusivas de eventos añadidas al listado.', en: 'Added Merit Cards as a new collectible category: 22 event-exclusive cards added to the list.' }
    ]
  },
  {
    version: '2.8.1',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Eliminadas cartas duplicadas de la sección Promos que ya estaban disponibles en Event Packs y Judge Packs.', en: 'Removed duplicate cards from Promos section that were already available in Event Packs and Judge Packs.' }
    ]
  },
  {
    version: '2.8.0',
    date: '30 de abril de 2026',
    changes: [
      { es: 'Añadidos Tokens como nueva categoría de coleccionismo con todas sus variantes (Tokens de Campeonato, etc).', en: 'Added Tokens as a new collectible category with all their variants (Championship Tokens, etc).' },
      { es: 'Añadidos Judge Packs 16, 17 y 18 con todas sus variantes promocionales de arte alternativo.', en: 'Added Judge Packs 16, 17, and 18 with all their alternate art promo variants.' },
      { es: 'Reorganizadas las cartas de arte alternativo correspondientes a los paquetes de torneos para mantener la consistencia.', en: 'Reorganized alternate art cards corresponding to tournament packs to maintain consistency.' }
    ]
  },
  {
    version: '2.1.05',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Actualizada la lista de cartas baneadas con más de 60 nuevas incorporaciones.', en: 'Updated the banned cards list with over 60 new entries.' },
      { es: 'Corregidos estados legales que pasaron de Errata/Limitada a Baneada.', en: 'Corrected legal statuses that changed from Errata/Limited to Banned.' }
    ]
  },
  {
    version: '2.1.04',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Añadida referencia oficial para cartas baneadas y limitadas.', en: 'Added official reference for banned and limited cards.' }
    ]
  },
  {
    version: '2.1.03',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Corregido el estado legal de la última tanda de cartas a "Limitadas" (1 copia).', en: 'Corrected legal status of the latest batch of cards to "Limited" (1 copy).' },
      { es: 'Mantenida la infraestructura para futuros baneos en formato BO1.', en: 'Maintained infrastructure for future BO1 format bans.' }
    ]
  },
  {
    version: '2.1.02',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Añadido el estado legal "Baneada (BO1)" y listado de cartas baneadas en este formato.', en: 'Added "Banned (BO1)" legal status and list of banned cards for this format.' },
      { es: 'Actualizada la lista de cartas con restricciones legales.', en: 'Updated the list of cards with legal restrictions.' }
    ]
  },
  {
    version: '2.1.01',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Nuevo formato de versión implementado (2.1.01).', en: 'New version format implemented (2.1.01).' },
      { es: 'Eliminado el correo electrónico del ranking de coleccionistas para mayor privacidad.', en: 'Removed email from collectors ranking for better privacy.' },
      { es: 'Solucionado el error de notificaciones repetitivas en logros de set (ej. SD10).', en: 'Fixed repetitive notification bug in set achievements (e.g., SD10).' },
      { es: 'Corregida la imagen oficial de la carta BT24-063_SPR.', en: 'Corrected official image for card BT24-063_SPR.' },
      { es: 'Optimización de la limpieza de logros obsoletos en la base de datos.', en: 'Optimization of obsolete achievement cleanup in the database.' }
    ]
  },
  {
    version: '2.1.00',
    date: '25 de abril de 2026',
    changes: [
      { es: 'Corregido error de persistencia en notificaciones de logros.', en: 'Fixed persistence bug in achievement notifications.' },
      { es: 'Corrección de imagen para la carta BT24-063_SPR.', en: 'Image fix for card BT24-063_SPR.' },
      { es: 'Mejorada la sincronización de logros entre sesiones.', en: 'Improved achievement synchronization between sessions.' }
    ]
  },
  {
    version: '2.0.0',
    date: '24 de abril, 2024',
    changes: [
      { es: '¡Versión 2.0! Completada la integración de todas las variantes oficiales (PR, SPR, etc.) detectadas en la web oficial.', en: 'Version 2.0! Completed integration of all official variants (PR, SPR, etc.) detected from the official website.' },
      { es: 'Añadidas más de 400 nuevas versiones de cartas de productos especiales (SD, XD, TB, DB, EB, EX).', en: 'Added over 400 new card versions from special products (SD, XD, TB, DB, EB, EX).' }
    ]
  },
  {
    version: '1.9.7',
    date: '24 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR de BT26 y BT27: 33 nuevas versiones añadidas.', en: 'Added PR variants for BT26 and BT27: 33 new versions added.' }
    ]
  },
  {
    version: '1.9.6',
    date: '24 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT25 Legend of the Dragon Balls: 26 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT25 Legend of the Dragon Balls: 26 new versions added.' }
    ]
  },
  {
    version: '1.9.5',
    date: '24 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT24 Beyond Evolution: 95 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT24 Beyond Evolution: 95 new versions added.' }
    ]
  },
  {
    version: '1.9.4',
    date: '24 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR de BT23 Perfect Combination: 10 nuevas versiones añadidas.', en: 'Added PR variants for BT23 Perfect Combination: 10 new versions added.' }
    ]
  },
  {
    version: '1.9.3',
    date: '24 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR de BT22 Critical Blow: 21 nuevas versiones añadidas.', en: 'Added PR variants for BT22 Critical Blow: 21 new versions added.' }
    ]
  },
  {
    version: '1.9.2',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR de BT21 Wild Resurgence: 17 nuevas versiones añadidas.', en: 'Added PR variants for BT21 Wild Resurgence: 17 new versions added.' }
    ]
  },
  {
    version: '1.9.1',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR de BT20 Power Absorbed: 78 nuevas versiones añadidas al catálogo.', en: 'Added PR variants for BT20 Power Absorbed: 78 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.9.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT19 Fighter’s Ambition: 18 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT19 Fighter’s Ambition: 18 new versions added.' }
    ]
  },
  {
    version: '1.8.9',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT18 Dawn of the Z-Legends: 31 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT18 Dawn of the Z-Legends: 31 new versions added.' }
    ]
  },
  {
    version: '1.8.8',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT17 Ultimate Fusion: 14 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT17 Ultimate Fusion: 14 new versions added.' }
    ]
  },
  {
    version: '1.8.7',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes PR y SPR de BT16 Realm of the Gods: 19 nuevas versiones añadidas.', en: 'Added PR and SPR variants for BT16 Realm of the Gods: 19 new versions added.' }
    ]
  },
  {
    version: '1.8.6',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) y SPR de BT15: 9 nuevas versiones añadidas al catálogo.', en: 'Added BT15 Promo variants (Alter) and SPRs: 9 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.8.5',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT14: 14 nuevas versiones añadidas al catálogo.', en: 'Added BT14 Promo variants (Alter): 14 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.8.4',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT13: 15 nuevas versiones añadidas al catálogo.', en: 'Added BT13 Promo variants (Alter): 15 new versions added to the catalog.' }
    ]
  },
  {
    version: '2.7.1',
    date: '29 de abril, 2024',
    changes: [
      { es: 'Diseño de cartas más moderno con bordes menos redondeados.', en: 'More modern card design with less rounded corners.' },
      { es: 'Eliminada sincronización manual; ahora el ranking se actualiza al instante.', en: 'Manual sync removed; ranking now updates instantly.' },
      { es: 'Limpieza de herramientas administrativas en el perfil.', en: 'Cleaned up administrative tools in profile.' }
    ]
  },
  {
    version: '2.7.0',
    date: '28 de abril, 2024',
    changes: [
      { es: 'Añadidos Event Packs 13, 14, 15, 16, 17 y 18 con todas sus variantes promocionales.', en: 'Added Event Packs 13, 14, 15, 16, 17, and 18 with all their promo variants.' }
    ]
  },
  {
    version: '2.6.0',
    date: '27 de abril, 2024',
    changes: [
      { es: 'Actualizado Event Pack 11 con 10 nuevas cartas promocionales.', en: 'Updated Event Pack 11 with 10 new promo cards.' }
    ]
  },
  {
    version: '2.5.0',
    date: '27 de abril, 2024',
    changes: [
      { es: 'Añadido Event Pack 12 con 17 nuevas cartas promocionales.', en: 'Added Event Pack 12 with 17 new promo cards.' }
    ]
  },
  {
    version: '2.4.0',
    date: '27 de abril, 2024',
    changes: [
      { es: 'Añadido Event Pack 11 con la nueva carta promocional SS4 Vegeta.', en: 'Added Event Pack 11 with the new SS4 Vegeta promo card.' }
    ]
  },
  {
    version: '2.3.0',
    date: '27 de abril, 2024',
    changes: [
      { es: 'Añadido Event Pack 10 con 10 nuevas cartas promocionales.', en: 'Added Event Pack 10 with 10 new promo cards.' },
      { es: 'Corregido error de filtrado en las pestañas de Event Packs 08, 09 y 10.', en: 'Fixed filtering bug in Event Packs 08, 09, and 10 tabs.' }
    ]
  },
  {
    version: '2.2.0',
    date: '27 de abril, 2024',
    changes: [
      { es: 'Actualizada la lógica de progreso global: ahora el 100% solo se alcanza si se tienen todas las versiones físicas (incluyendo variantes y SPRs).', en: 'Updated global progress logic: 100% is now only reached if all physical versions (including variants and SPRs) are owned.' },
      { es: 'Añadido selector de idioma persistente para nuevos usuarios.', en: 'Added persistent language selector for new users.' },
      { es: 'Corregida la procedencia y el etiquetado de los Event Packs 08 y 09.', en: 'Fixed sourcing and tagging for Event Packs 08 and 09.' }
    ]
  },
  {
    version: '1.8.3',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT12: 11 nuevas versiones añadidas al catálogo.', en: 'Added BT12 Promo variants (Alter): 11 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.8.2',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT10 y BT11: 56 nuevas versiones añadidas al catálogo.', en: 'Added BT10 & BT11 Promo variants (Alter): 56 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.8.1',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT9: 11 nuevas versiones añadidas al catálogo.', en: 'Added BT9 Promo variants (Alter): 11 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.8.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadido soporte para variantes Promo de BT8 Malicious Machinations.', en: 'Added support for BT8 Malicious Machinations Promo variants.' }
    ]
  },
  {
    version: '1.7.9',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT7: 115 nuevas versiones añadidas al catálogo.', en: 'Added BT7 Promo variants (Alter): 115 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.7.8',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT6: 70 nuevas versiones añadidas al catálogo.', en: 'Added BT6 Promo variants (Alter): 70 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.7.7',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT5: 21 nuevas versiones añadidas al catálogo.', en: 'Added BT5 Promo variants (Alter): 21 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.7.6',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT4: 17 nuevas versiones añadidas al catálogo.', en: 'Added BT4 Promo variants (Alter): 17 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.7.5',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Corregida errata en número de carta: BT3-063_PR2 ahora es BT3-063_PR02.', en: 'Corrected card number typo: BT3-063_PR2 is now BT3-063_PR02.' }
    ]
  },
  {
    version: '1.7.4',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo (Alter) de BT3: 22 nuevas versiones añadidas al catálogo.', en: 'Added BT3 Promo variants (Alter): 22 new versions added to the catalog.' }
    ]
  },
  {
    version: '1.7.3',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Corregidas y añadidas variantes Promo (Alter) de BT2: BT2-039_PR integrada correctamente.', en: 'Corrected and added BT2 Promo variants (Alter): BT2-039_PR correctly integrated.' }
    ]
  },
  {
    version: '1.7.2',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Eliminada información automática de promociones a petición del usuario', en: 'Removed automatic promo information per user request' }
    ]
  },
  {
    version: '1.7.1',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Corregida P-002: eliminada nota regional que solo aplica a P-001', en: 'Fixed P-002: removed regional note only applying to P-001' },
      { es: 'Refinado formato oficial: añadido prefijo \"PR CARD\" a todas las notas', en: 'Refined official format: added \"PR CARD\" prefix to all notes' },
      { es: 'Ajustada precisión en packs promocionales y dash packs de todas las series', en: 'Adjusted precision in promo packs and dash packs for all series' }
    ]
  },
  {
    version: '1.7.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Sincronización estricta de procedencia con la web oficial (campo Notes)', en: 'Strict synchronization of source origin with the official website (Notes field)' },
      { es: 'Corregida la procedencia de P-001 a P-600 con datos reales paso a paso', en: 'Fixed source origin for P-001 to P-600 with real step-by-step data' },
      { es: 'Añadidas notas específicas de regiones (ej. Latin America para P-001)', en: 'Added region-specific notes (e.g. Latin America for P-001)' }
    ]
  },
  {
    version: '1.6.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Sistema de procedencia de cartas: Ahora puedes ver el producto original de donde proviene cada carta (Tournament Pack, Dash Pack, etc.).', en: 'Card source system: You can now see the original product where each card comes from (Tournament Pack, Dash Pack, etc.).' },
      { es: 'Enriquecimiento de metadatos para más de 700 cartas promocionales y todos los sets principales.', en: 'Metadata enrichment for over 700 promo cards and all main sets.' }
    ]
  },
  {
    version: '1.5.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Sistema de efectos de brillo (Foil) mejorado y progresivo según la rareza de la carta (R, SR, SPR, SCR, GDR).', en: 'Improved and progressive foil effects based on card rarity (R, SR, SPR, SCR, GDR).' }
    ]
  },
  {
    version: '1.4.0',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Ampliación de la colección BT1: Añadidas variantes Promo de BT1-109 y BT1-110.', en: 'BT1 collection expansion: Added Promo variants for BT1-109 and BT1-110.' }
    ]
  },
  {
    version: '1.3.9',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo BT1-107_PR y BT1-107_PR02.', en: 'Added BT1-107_PR and BT1-107_PR02 Promo variants.' }
    ]
  },
  {
    version: '1.3.8',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes Promo de BT1: BT1-069_PR, BT1-079_PR, BT1-080_PR/02 y BT1-100_PR.', en: 'Added BT1 Promo variants: BT1-069_PR, BT1-079_PR, BT1-080_PR/02 and BT1-100_PR.' }
    ]
  },
  {
    version: '1.3.7',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Eliminadas las referencias a precios y valores de mercado del tracker.', en: 'Removed all price and market value references from the tracker.' }
    ]
  },
  {
    version: '1.3.6',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Corregidos datos de BT1: Eliminada variante SPR inexistente de Beerus (BT1-041).', en: 'Fixed BT1 data: Removed non-existent Beerus SPR (BT1-041).' }
    ]
  },
  {
    version: '1.3.5',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Actualización visual y de identidad para un logro secreto.', en: 'Visual and identity update for a secret achievement.' }
    ]
  },
  {
    version: '1.3.4',
    date: '23 de abril, 2024',
    changes: [
      { es: 'Nuevo logro secreto para coleccionistas de variantes.', en: 'New secret achievement for variant collectors.' }
    ]
  },
  {
    version: '1.3.3',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Eliminado filtro por coste de energía por errores en los datos.', en: 'Removed energy cost filter due to data inaccuracies.' }
    ]
  },
  {
    version: '1.3.2',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Implementado filtro por coste de energía (comenzando por BT1).', en: 'Implemented energy cost filter (starting with BT1).' },
      { es: 'Añadidos datos de coste de energía a la colección Galactic Battle (BT1).', en: 'Added energy cost data to Galactic Battle collection (BT1).' }
    ]
  },
  {
    version: '1.3.1',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Actualizado estado legal de Senzu Bean (Errata) y añadidas variantes de Whis\'s Coercion.', en: 'Updated Senzu Bean legal status (Errata) and added Whis\'s Coercion variants.' },
      { es: 'Inclusión de metadatos de obtención para las nuevas promos de BT1.', en: 'Included acquisition metadata for new BT1 promos.' }
    ]
  },
  {
    version: '1.3.0',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Expansión masiva de la base de datos promocional de BT1 (Champa, Piccolo, Cabba, Objection, Senzu).', en: 'Massive BT1 promo database expansion (Champa, Piccolo, Cabba, Objection, Senzu).' },
      { es: 'Actualización de estados legales y metadatos de obtención para cartas clásicas.', en: 'Updated legal status and acquisition metadata for classic cards.' },
      { es: 'Ajustes en la iconografía de logros de comunidad.', en: 'Adjustments to community achievement iconography.' }
    ]
  },
  {
    version: '1.2.9',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Mejorada la búsqueda de cartas permitiendo omitir guiones y caracteres especiales en los códigos.', en: 'Improved card search allowing users to omit hyphens and special characters in codes.' },
      { es: 'Normalización de búsqueda para mayor flexibilidad en nombres y números de carta.', en: 'Search normalization for greater flexibility in names and card numbers.' }
    ]
  },
  {
    version: '1.2.8',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Añadidas variantes promo de BT1-005 (Champa) con metadatos específicos.', en: 'Added BT1-005 (Champa) promo variants with specific metadata.' },
      { es: 'Actualización de la base de datos de cartas licenciadas.', en: 'Updated licensed card database.' }
    ]
  },
  {
    version: '1.2.7',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Actualización del sistema de gestión de activos y optimización de versiones.', en: 'Asset management system update and version optimization.' },
      { es: 'Añadidos nuevos trofeos ocultos al sistema de logros.', en: 'Added new hidden trophies to the achievement system.' }
    ]
  },
  {
    version: '1.2.6',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Refactorización de la interfaz de estados legales.', en: 'Refactored legal status interface.' },
      { es: 'Implementación de indicadores visuales (dots) en miniaturas de cartas.', en: 'Implemented visual status indicators (dots) on card thumbnails.' },
      { es: 'Añadidos filtros avanzados por estado legal (Baneada, Limitada, Errata).', en: 'Added advanced filters by legal status (Banned, Limited, Errata).' }
    ]
  },
  {
    version: '1.2.5',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Implementación de metadatos por expansión (BT1: Galactic Battle).', en: 'Implemented set metadata system (BT1: Galactic Battle).' },
      { es: 'Visualización de legalidad y fechas de lanzamiento en el visor de detalles.', en: 'Legal status and release date visualization in details viewer.' }
    ]
  },
  {
    version: '1.2.4',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Unificación de base de datos para estados legales y fechas.', en: 'Unified database for legal status and dates.' },
      { es: 'Mejoras en la consistencia de metadatos globales.', en: 'Global metadata consistency improvements.' }
    ]
  },
  {
    version: '1.2.3',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Añadidos activos visuales para logros de colección avanzada.', en: 'Added visual assets for advanced collection achievements.' },
      { es: 'Correcciones menores en la visualización de iconos.', en: 'Minor icon visualization fixes.' }
    ]
  },
  {
    version: '1.2.2',
    date: '22 de abril, 2024',
    changes: [
      { es: 'Actualización de iconos del sistema de logros generales.', en: 'General achievement system icon updates.' },
      { es: 'Optimización de carga de recursos estáticos.', en: 'Static asset loading optimization.' }
    ]
  },
  {
    version: '1.2.1',
    date: '21 de abril, 2024',
    changes: [
      { es: 'Mejoras en el rendimiento de los filtros de búsqueda.', en: 'Search filter performance improvements.' },
      { es: 'Sincronización optimizada con Firestore para inventarios grandes.', en: 'Optimized Firestore sync for large inventories.' }
    ]
  },
  {
    version: '1.2.0',
    date: '20 de abril, 2024',
    changes: [
      { es: 'Lanzamiento del nuevo sistema de Logros y Títulos.', en: 'Launch of the new Achievement and Titles system.' },
      { es: 'Nueva vista de estadísticas detalladas por rareza y color.', en: 'New detailed statistics view by rarity and color.' },
      { es: 'Rediseño del panel de perfil de usuario.', en: 'User profile panel redesign.' }
    ]
  }
];

const isAlternative = (cardId: string) => {
  if (cardId.includes('_SPR') || cardId.includes('_GDR') || cardId.includes('_W') || cardId.includes('_SLR')) return false;
  return cardId.includes('_');
};

const isVirtualSet = (setId: string) => {
  return ['COL01', 'COL02', 'COL03', 'COL05', 'COL08', 'EP01', 'EP02', 'EP03', 'EP04', 'EP05', 'EP06', 'EP07', 'EP08', 'EP09', 'EP10', 'EP11', 'EP13', 'EP14', 'EP15', 'EP16', 'EP17', 'EP18', 'COL06', 'COL07', 'JP01', 'JP02', 'JP03', 'JP04', 'JP05', 'JP06', 'JP07', 'JP08', 'JP09', 'JP10', 'JP11', 'JP12', 'JP13', 'JP14', 'JP15', 'JP16', 'JP17', 'JP18', 'TP01', 'TP02', 'TP03', 'TP04', 'TP05', 'TP06', 'TP07', 'TP08', 'TP09', 'TP10', 'UB24-1', 'UB24-2', 'UB24-3', 'UB25-1', 'UB25-2', 'UB25-4', 'UB25-5', 'UB26-1', 'UB26-2', '1ST_ANNIV', '1ST_ANNIV_FOLDER', '40TH_ANNIV', '40TH_ANNIV_V2', '40TH_ANNIV_FOLDER', '40TH_ANNIV_FOLDER_MAIN', '40TH_ANNIV_VOL1_FOLDER', '40TH_ANNIV_VOL2_FOLDER', 'LP01', 'LP01_FOLDER', 'LP02', 'LP02_FOLDER', 'BCG_FEST_24', 'FP', 'AS2025', 'AS2026', 'PCC01', 'PCC02', 'ANNIVERSARY_FOLDER', 'SLEEVES_FOLDER', 'PLAYMATS_FOLDER', 'PREMIUM_COLLECTION_FOLDER', 'CARD_CASE_FOLDER', 'RE_SB01_FOLDER', 'RE_SB02_FOLDER', 'UB_2024_FOLDER', 'UB_2025_FOLDER', 'UB_2026_FOLDER', 'CH2026_FOLDER', 'CH26_W1_FOLDER', 'BCG_FEST_FOLDER'].includes(setId) || setId.startsWith('FP_') || setId.startsWith('CP_') || setId.startsWith('SL') || setId.startsWith('PM') || setId.startsWith('CC-') || setId.startsWith('ACS') || setId.startsWith('CH2024_') || setId.startsWith('CH25_') || setId.startsWith('CH26_') || setId.startsWith('SP01_') || setId.startsWith('TR_');
};

const EVENT_PACK_01 = [
  'TB1-003_EP01', 'P-003_EP01', 'P-009_EP01', 'EX2-01_EP01', 
  'P-015_EP01', 'EX2-02_EP01', 'P-033_EP01', 'BT3-043_EP01', 
  'BT3-068_EP01', 'BT3-100_EP01'
];

const EVENT_PACK_02 = [
  'TB1-012_EP02', 'TB1-027_EP02', 'P-047_EP02', 'P-057_EP02', 
  'P-060_EP02', 'P-062_EP02', 'TB1-088_EP02', 'EX3-14_EP02'
];

const EVENT_PACK_03 = [
  'BT4-012_EP03', 'BT4-048_EP03', 'BT1-052_EP03', 'BT6-060_EP03',
  'BT4-093_EP03', 'BT1-109_EP03', 'BT5-112_EP03', 'BT5-117_EP03',
  'BT4-118_EP03', 'BT3-120_EP03'
];

const EVENT_PACK_04 = [
  'BT5-008_EP04', 'BT5-041_EP04', 'BT5-061_EP04', 'BT5-088_EP04',
  'BT5-119_EP04', 'BT6-110_EP04', 'BT6-114_EP04', 'BT7-111_EP04',
  'P-105_EP04', 'EX3-08_EP04'
];

const EVENT_PACK_05 = [
  'BT1-027_EP05', 'BT3-017_EP05', 'BT3-113_EP05', 'BT5-108_EP05',
  'BT6-057_EP05', 'BT8-115_EP05', 'TB2-011_EP05', 'TB2-067_EP05',
  'TB3-065_EP05', 'BT7-103_EP05'
];

const EVENT_PACK_06 = [
  'TB3-009_EP06', 'BT9-018_EP06', 'BT9-037_EP06', 'BT9-039_EP06',
  'DB1-040_EP06', 'BT2-060_EP06', 'DB1-064_EP06', 'BT5-070_EP06',
  'BT7-100_EP06', 'BT9-114_EP06'
];

const EVENT_PACK_07 = [
  'DB2-042_EP07', 'SD8-05_EP07', 'DB2-119_EP07', 'BT10-126_EP07',
  'DB1-038_EP07', 'DB2-127_EP07', 'P-248_EP07', 'DB2-146_EP07',
  'DB1-052_EP07', 'SD8-04_EP07'
];

const EVENT_PACK_08 = [
  'BT10-044_EP08', 'TB3-047_EP08', 'BT10-105_EP08', 'BT10-145_EP08', 'DB2-160_EP08',
  'P-219_EP08', 'P-261_EP08', 'P-263_EP08', 'P-274_EP08', 'BT10-088_EP08'
];

const EVENT_PACK_09 = [
  'BT12-004_EP09', 'BT16-012_EP09', 'BT11-103_EP09', 'DB3-115_EP09', 'BT9-132_EP09',
  'BT13-137_EP09', 'P-220_EP09', 'P-288_EP09', 'P-331_EP09', 'EB1-35_EP09'
];

const EVENT_PACK_10 = [
  'BT14-007_EP10', 'DB3-055_EP10', 'BT14-063_EP10', 'BT9-102_EP10', 'BT12-113_EP10',
  'BT14-122_EP10', 'BT14-135_EP10', 'EX6-27_EP10', 'P-333_EP10', 'EB1-62_EP10'
];

const EVENT_PACK_11 = [
  'BT13-130_EP11', 'EX11-07_EP11', 'DB2-092_EP11', 'DB3-040_EP11',
  'BT17-134_EP11', 'DB3-013_EP11', 'BT8-033_EP11', 'DB2-156_EP11', 'P-191_EP11',
  'BT14-097_EP11'
];

const EVENT_PACK_12 = [
  'DB1-003_EP12', 'BT14-005_EP12', 'SD11-02_EP12', 'BT11-035_EP12', 'DB1-036_EP12',
  'BT16-045_EP12', 'BT21-058_EP12', 'DB3-059_EP12', 'BT21-077_EP12', 'DB3-089_EP12',
  'DB2-097_EP12', 'DB3-093_EP12', 'BT12-120_EP12', 'EX13-14_EP12', 'BT13-146_EP12', 'DB2-165_EP12',
  'DB2-174_EP12', 'EB1-55_EP12'
];

const EVENT_PACK_13 = [
  'DB3-101_EP13', 'BT9-110_EP13', 'BT10-090_EP13', 'TB3-029_EP13', 'EX13-04_EP13',
  'BT23-063_EP13', 'BT8-031_EP13', 'BT8-074_EP13', 'BT8-015_EP13',
  'BT8-051_EP13', 'BT18-006_EP13', 'BT18-144_EP13', 'BT22-136_EP13', 'BT18-086_EP13',
  'BT22-134_EP13', 'BT23-108_EP13', 'BT5-112_EP13', 'BT5-108_EP13'
];

const EVENT_PACK_14 = [
  'DB2-129_EP14', 'BT14-060_EP14', 'BT19-036_EP14', 'P-383_EP14', 'XD01-10_EP14',
  'BT13-082_EP14', 'BT18-143_EP14', 'BT11-132_EP14', 'SD18-02_EP14', 'BT18-069_EP14',
  'BT16-140_EP14', 'P-159_EP14', 'SD17-02_EP14', 'BT16-018_EP14', 'BT16-069_EP14',
  'BT16-092_EP14', 'BT16-125_EP14', 'SD14-05_EP14'
];

const EVENT_PACK_15 = [
  'BT13-151_EP15', 'BT8-065_EP15', 'BT10-077_EP15',
  'BT16-091_EP15', 'BT10-030_EP15', 'BT9-023_EP15', 'EB1-63_EP15',
  'BT10-010_EP15', 'P-113_EP15', 'BT20-121_EP15',
  'BT15-073_EP15', 'P-262_EP15', 'EB1-13_EP15',
  'BT11-042_EP15', 'DB3-059_EP15', 'BT9-087_EP15', 'BT12-120_EP15', 'P-191_EP15'
];

const EVENT_PACK_16 = [
  'BT3-027_EP16', 'BT21-052_EP16', 'P-403_EP16', 'EX6-30_EP16', 'BT5-073_EP16',
  'BT17-004_EP16', 'P-455_EP16', 'BT10-123_EP16', 'BT10-062_EP16',
  'EX19-12_EP16', 'BT13-137_EP16', 'P-405_EP16', 'TB1-023_EP16', 'BT13-098_EP16',
  'EX6-36_EP16', 'EB1-20_EP16', 'BT12-113_EP16', 'BT12-128_EP16'
];

const EVENT_PACK_17 = [
  'BT24-133_EP17', 'BT17-134_EP17', 'BT4-107_EP17', 'DB3-136_EP17', 'BT25-083_EP17',
  'P-082_EP17', 'DB3-012_EP17', 'BT12-108_EP17', 'BT7-073_EP17', 'BT25-140_EP17',
  'BT22-127_EP17', 'BT22-112_EP17', 'BT21-062_EP17', 'BT25-130_EP17', 'BT24-063_EP17',
  'BT20-011_EP17', 'BT25-009_EP17', 'BT25-107_EP17'
];

const EVENT_PACK_18 = [
  'BT27-048_EP18', 'SD23-04_EP18', 'DB3-101_EP18', 'P-614_EP18', 'BT8-074_EP18',
  'BT25-120_EP18', 'BT8-015_EP18', 'BT27-019_EP18', 'BT13-082_EP18', 'BT10-055_EP18',
  'BT23-115_EP18', 'BT14-083_EP18', 'BT11-050_EP18', 'DB2-029_EP18', 'P-537_EP18',
  'BT24-136_EP18', 'BT16-045_EP18', 'BT11-127_EP18'
];

const JUDGE_PACK_01 = ['P-003_JP01', 'P-015_JP01', 'P-016_JP01', 'P-018_JP01'];
const JUDGE_PACK_02 = ['P-030_JP02', 'P-032_JP02', 'P-033_JP02', 'P-036_JP02', 'P-035_JP02'];
const JUDGE_PACK_03 = ['P-053_JP03', 'P-049_JP03', 'P-040_JP03', 'P-048_JP03', 'P-052_JP03'];
const JUDGE_PACK_04 = ['BT4-073_JP04', 'BT1-005_JP04', 'BT4-103_JP04', 'BT2-093_JP04', 'BT1-110_JP04', 'BT2-060_JP04', 'BT2-044_JP04', 'BT3-110_JP04', 'BT1-080_JP04', 'BT2-010_JP04'];
const JUDGE_PACK_05 = ['BT1-055_JP05', 'BT2-104_JP05', 'BT5-038_JP05', 'BT1-076_JP05', 'BT4-102_JP05', 'BT1-108_JP05', 'BT5-073_JP05', 'BT2-067_JP05', 'BT5-075_JP05', 'P-077_JP05'];
const JUDGE_PACK_06 = ['BT5-115_JP06', 'BT5-109_JP06', 'BT6-107_JP06', 'BT5-101_JP06', 'P-090_JP06', 'BT5-050_JP06', 'TB3-048_JP06', 'BT6-026_JP06', 'BT6-025_JP06', 'BT5-023_JP06'];
const JUDGE_PACK_07 = ['EX3-08_JP07', 'EX4-03_JP07', 'P-112_JP07', 'BT3-008_JP07', 'BT1-025_JP07', 'BT7-120_JP07', 'TB2-024_JP07', 'BT6-117_JP07', 'BT7-117_JP07', 'P-159_JP07'];
const JUDGE_PACK_08 = ['BT7-106_JP08', 'DB1-048_JP08', 'BT8-113_JP08', 'BT8-053_JP08', 'BT7-078_JP08', 'BT8-120_JP08', 'BT9-102_JP08', 'BT7-107_JP08', 'BT7-029_JP08', 'BT9-123_JP08'];
const JUDGE_PACK_09 = ['BT10-140_JP09', 'DB1-020_JP09', 'DB1-096_JP09', 'BT6-013_JP09', 'BT4-061_JP09', 'BT3-120_JP09', 'BT6-012_JP09', 'TB1-044_JP09', 'EX5-02_JP09', 'TB3-025_JP09'];
const JUDGE_PACK_10 = ['EX6-35_JP10', 'P-241_JP10', 'P-206_JP10', 'DB2-143_JP10', 'BT9-112_JP10', 'DB1-101_JP10', 'BT9-100_JP10', 'BT10-064_JP10', 'BT11-063_JP10', 'DB3-015_JP10'];
const JUDGE_PACK_11 = ['BT1-083_JP11', 'BT5-103_JP11', 'BT10-147_JP11', 'BT13-034_JP11', 'EB1-11_JP11', 'EB1-22_JP11', 'EB1-37_JP11', 'EB1-48_JP11', 'EX13-30_JP11', 'EX13-34_JP11'];
const JUDGE_PACK_12 = ['BT10-055_JP12', 'BT11-127_JP12', 'BT13-073_JP12', 'BT13-137_JP12', 'BT14-082_JP12', 'BT15-128_JP12', 'BT16-030_JP12', 'BT16-124_JP12', 'EB1-20_JP12', 'EX20-01_JP12'];
const JUDGE_PACK_13 = ['BT10-058_JP13', 'BT17-059_JP13', 'BT17-135_JP13', 'DB1-064_JP13', 'DB2-136_JP13', 'DB3-059_JP13', 'DB3-101_JP13', 'EX6-02_JP13', 'SD2-04_JP13', 'SD8-04_JP13'];
const JUDGE_PACK_14 = ['BT1-043_JP14', 'BT8-032_JP14', 'BT9-109_JP14', 'BT13-121_JP14', 'BT18-005_JP14', 'BT18-128_JP14', 'DB3-077_JP14', 'P-270_JP14', 'P-402_JP14', 'P-405_JP14'];
const JUDGE_PACK_15 = ['BT19-055_JP15', 'BT14-073_JP15', 'EX21-16_JP15', 'SD17-05_JP15', 'BT9-002_JP15', 'P-275_JP15', 'P-292_JP15', 'DB1-101_JP15', 'BT13-142_JP15', 'P-419_JP15'];
const JUDGE_PACK_16 = ['BT8-022_JP16', 'BT10-088_JP16', 'EX21-15_JP16', 'BT13-020_JP16', 'BT12-115_JP16', 'BT21-051_JP16', 'P-219_JP16', 'P-159_JP16', 'BT14-135_JP16', 'P-321_JP16'];
const JUDGE_PACK_17 = ['EX19-24_JP17', 'BT13-073_JP17', 'BT25-052_JP17', 'BT10-090_JP17', 'P-359_JP17', 'BT10-123_JP17', 'BT25-005_JP17', 'P-453_JP17', 'BT11-053_JP17', 'BT16-087_JP17'];
const JUDGE_PACK_18 = ['DB2-097_JP18', 'BT14-007_JP18', 'BT15-033_JP18', 'BT7-110_JP18', 'BT19-049_JP18', 'P-643_JP18', 'BT24-113_JP18', 'BT15-063_JP18', 'BT7-087_JP18', 'BT24-088_JP18'];

const TOURNAMENT_PACK_01_NORMAL = ['FS01-06_TP', 'FB01-005_TP', 'FB01-049_TP', 'FB01-057_TP', 'FB01-087_TP', 'FB01-088_TP', 'FB01-124_TP', 'FB01-128_TP'];
const TOURNAMENT_PACK_01_WINNER = ['FS01-06_TP_W', 'FB01-049_TP_W', 'FB01-087_TP_W', 'FB01-128_TP_W'];
const TOURNAMENT_PACK_02_NORMAL = ['FB02-004_TP', 'FB02-034_TP', 'FB02-047_TP', 'FB02-077_TP', 'FB02-051_TP', 'FB02-088_TP', 'FB02-110_TP', 'FB02-136_TP'];
const TOURNAMENT_PACK_02_WINNER = ['FB02-034_TP_W', 'FB02-051_TP_W', 'FB02-077_TP_W', 'FB02-136_TP_W'];

const TOURNAMENT_PACK_03_NORMAL = ['FB03-014_TP', 'FB03-032_TP', 'FB03-052_TP', 'FB03-061_TP', 'FB03-073_TP', 'FB03-081_TP', 'FB03-122_TP', 'FB03-124_TP'];
const TOURNAMENT_PACK_03_WINNER = ['FB03-032_TP_W', 'FB03-061_TP_W', 'FB03-081_TP_W', 'FB03-124_TP_W'];
const TOURNAMENT_PACK_04_NORMAL = ['FB03-022_TP', 'FB03-024_TP', 'FB03-050_TP', 'FB03-057_TP', 'FB03-086_TP', 'FB03-101_TP', 'FB03-114_TP', 'FB03-132_TP'];
const TOURNAMENT_PACK_04_WINNER = ['FB03-024_TP_W', 'FB03-050_TP_W', 'FB03-086_TP_W', 'FB03-114_TP_W'];
const TOURNAMENT_PACK_05_NORMAL = ['FB04-004_TP', 'FB04-006_TP', 'FB04-046_TP', 'FB04-057_TP', 'FB04-069_TP', 'FB04-091_TP', 'FB04-117_TP', 'FB04-119_TP'];
const TOURNAMENT_PACK_05_WINNER = ['FB04-046_TP_W', 'FB04-069_TP_W', 'FB04-091_TP_W', 'FB04-117_TP_W'];
const TOURNAMENT_PACK_06_NORMAL = ['FB05-007_TP', 'FB05-039_TP', 'FB05-048_TP', 'FB05-053_TP', 'FB05-071_TP', 'FB05-086_TP', 'FB05-106_TP', 'FB05-116_TP'];
const TOURNAMENT_PACK_06_WINNER = ['FB05-039_TP_W', 'FB05-053_TP_W', 'FB05-086_TP_W', 'FB05-116_TP_W'];
const TOURNAMENT_PACK_07_NORMAL = ['FP-044', 'FP-045', 'FP-046', 'FP-047', 'FP-048'];
const TOURNAMENT_PACK_07_WINNER = ['FP-044_W', 'FP-045_W', 'FP-046_W', 'FP-047_W', 'FP-048_W'];
const TOURNAMENT_PACK_08_NORMAL = ['FP-052', 'FP-053', 'FP-054', 'FP-055', 'FP-056'];
const TOURNAMENT_PACK_08_WINNER = ['FP-052_W', 'FP-053_W', 'FP-054_W', 'FP-055_W', 'FP-056_W'];
const TOURNAMENT_PACK_09_NORMAL = ['FP-063', 'FP-064', 'FP-065', 'FP-066', 'FP-067'];
const TOURNAMENT_PACK_09_WINNER = ['FP-063_W', 'FP-064_W', 'FP-065_W', 'FP-066_W', 'FP-067_W'];
const TOURNAMENT_PACK_10_NORMAL = ['FP-070', 'FP-071', 'FP-072', 'FP-073', 'FP-074'];
const ULTIMATE_BATTLE_2024_V3 = ['FB03-093_UB_V3_T8', 'FS03-10_UB_V3_W'];
const ULTIMATE_BATTLE_2025_V1 = ['FB04-114_UB_V1_T8', 'FB03-121_UB_V1_W', 'FB01-089_UB_V1_W', 'FS01-08_UB_V1_W'];
const ULTIMATE_BATTLE_2025_V2 = ['FB05-080_UB_V2_T8', 'FB05-030_UB_V2_W'];
const ULTIMATE_BATTLE_2025_V4 = ['SB01-018_UB_V4_W', 'FP-041_UB_V4_T8'];
const ULTIMATE_BATTLE_2025_V5 = ['SB02-007_40TH_W', 'FB07-104_40TH_T8'];
const ULTIMATE_BATTLE_2026_V1 = ['FB07-035_UB_26_V1_W', 'FB08-024_UB_26_V1_T8'];
const ULTIMATE_BATTLE_2026_V2 = ['FS11-07_UB_26_V2_W', 'FB09-010_UB_26_V2_T8'];

const LIMITED_PACK_26_01 = [
  'FB09-006_LP26_W1', 'FB09-008_LP26_W1', 'FB09-009_LP26_W1', 'FB09-023_LP26_W1',
  'FB09-033_LP26_W1', 'FB09-038_LP26_W1', 'FB09-043_LP26_W1', 'FB09-047_LP26_W1',
  'FB09-052_LP26_W1', 'FB09-056_LP26_W1', 'FB09-058_LP26_W1', 'FB09-062_LP26_W1',
  'FB09-074_LP26_W1', 'FB09-080_LP26_W1', 'FB09-092_LP26_W1', 'FB09-094_LP26_W1',
  'FB09-113_LP26_W1', 'FB09-116_LP26_W1', 'FB09-118_LP26_W1', 'FB09-120_LP26_W1'
];
const CHAMPIONSHIP_2026_W1_TOP = ['FB09-037_CH26_T4', 'FB09-060_CH26_T8'];
const CHAMPIONSHIP_2026_W1_SERIAL = ['FB09-007_CH26_SE'];

const LP02_NORMAL = ['FB02-047_LP02', 'FB05-100_LP02', 'FS02-03_LP02', 'FS07-12_LP02', 'SB02-002_LP02', 'SB02-003_LP02', 'SB02-011_LP02', 'SB02-049_LP02', 'SB02-059_LP02'];
const T1ST_ANNIV_EVENT = ['FP-037_1ST_ANNIV', 'FB05-053_1ST_ANNIV_W'];
const T40TH_ANNIV_EVENT = ['FB05-054_40TH_T8', 'SB01-057_40TH_W'];
const LP01_NORMAL = ['FB02-063_LP01', 'FB04-072_LP01', 'FB05-031_LP01', 'FB05-099_LP01', 'FB06-029_LP01', 'FS04-11_LP01', 'SB01-053_LP01', 'FP-034_LP01', 'FP-045_LP01'];

const PCC01_NORMAL = ['FS01-01_P1', 'FS02-01_P1', 'FS03-01_P1', 'FS04-01_P1', 'FS05-01_P1'];
const PCC02_NORMAL = ['FB02-119_P3', 'FB04-012_P3', 'FB06-036_P1', 'FB06-062_P1', 'FB06-097_P3'];

const LIMITED_PACK_25_01_NORMAL = ['FB02-029_LCP01', 'FB03-047_LCP01', 'FB04-042_LCP01', 'FB04-060_LCP01', 'FB04-076_LCP01', 'FB04-085_LCP01', 'FB04-095_LCP01', 'FB04-117_LCP01', 'FB04-123_LCP01', 'FS01-16_LCP01'];
const LIMITED_PACK_25_01_WINNER = ['FB02-029_LCP01_W', 'FB03-047_LCP01_W', 'FB04-042_LCP01_W', 'FB04-060_LCP01_W', 'FB04-076_LCP01_W', 'FB04-085_LCP01_W', 'FB04-095_LCP01_W', 'FB04-117_LCP01_W', 'FB04-123_LCP01_W', 'FS01-16_LCP01_W'];
const CHAMPIONSHIP_25_W1_TOP = ['FB04-094_CP25_W1_T', 'FB04-130_CP25_W1_T'];
const CHAMPIONSHIP_25_W1_SERIAL = ['FB04-012_SE_CP25'];

const LIMITED_PACK_25_02_NORMAL = ['FB03-123_LCP02', 'FB05-076_LCP02', 'FB06-013_LCP02', 'FB06-044_LCP02', 'FB06-057_LCP02', 'SB01-013_LCP02', 'SB01-021_LCP02', 'SB01-024_LCP02', 'SB01-034_LCP02', 'SB01-047_LCP02'];
const LIMITED_PACK_25_02_WINNER = ['FB03-123_LCP02_W', 'FB05-076_LCP02_W', 'FB06-013_LCP02_W', 'FB06-044_LCP02_W', 'FB06-057_LCP02_W', 'SB01-013_LCP02_W', 'SB01-021_LCP02_W', 'SB01-024_LCP02_W', 'SB01-034_LCP02_W', 'SB01-047_LCP02_W'];
const CHAMPIONSHIP_25_W2_TOP = ['SB01-012_CP25_W2_T', 'FB06-097_CP25_W2_T'];

const CHAMPIONSHIP_25_FINALS_TOP = ['SB02-053_FNL25_128', 'FB06-063_FNL25_64', 'FB04-129_FNL25_32'];
const CHAMPIONSHIP_25_FINALS_TROPHY = ['FB07-121_FNL25_3RD', 'FB07-121_FNL25_2ND', 'FB07-121_FNL25_CHAMP'];
const CHAMPIONSHIP_25_GFINALS_TROPHY = ['FB07-122_GFNL25_3RD', 'FB07-122_GFNL25_2ND', 'FB07-122_GFNL25_CHAMP'];

const CHAMPIONSHIP_PACK_01_NORMAL = [
  'FB01-005_CP', 'FB02-033_CP', 'FB02-039_CP', 'FB02-042_CP', 
  'FB02-085_CP', 'FB02-086_CP', 'FB02-132_CP', 'FB02-137_CP'
];
const CHAMPIONSHIP_PACK_01_ALT = [
  'FB01-005_CP_A', 'FB02-033_CP_A', 'FB02-039_CP_A', 'FB02-042_CP_A', 
  'FB02-085_CP_A', 'FB02-086_CP_A', 'FB02-132_CP_A', 'FB02-137_CP_A'
];
const CHAMPIONSHIP_PACK_02_NORMAL = [
  'FB03-011_CP2', 'FB02-102_CP2', 'FB03-023_CP2', 'FB03-049_CP2', 
  'FB03-075_CP2', 'FB03-083_CP2', 'FB03-119_CP2', 'FS05-16_CP2'
];
const CHAMPIONSHIP_PACK_02_ALT = [
  'FB03-011_CP2_A', 'FB02-102_CP2_A', 'FB03-023_CP2_A', 'FB03-049_CP2_A', 
  'FB03-075_CP2_A', 'FB03-083_CP2_A', 'FB03-119_CP2_A', 'FS05-16_CP2_A'
];
const CHAMPIONSHIP_PACK_03_NORMAL = [
  'FB01-004_CP3', 'FB02-012_CP3', 'FB02-049_CP3', 'FB02-116_CP3', 'FB03-028_CP3',
  'FB03-127_CP3', 'FS03-13_CP3', 'FS03-16_CP3', 'FS04-11_CP3', 'FS05-15_CP3'
];
const CHAMPIONSHIP_PACK_03_ALT = [
  'FB01-004_CP3_A', 'FB02-012_CP3_A', 'FB02-049_CP3_A', 'FB02-116_CP3_A', 'FB03-028_CP3_A',
  'FB03-127_CP3_A', 'FS03-13_CP3_A', 'FS03-16_CP3_A', 'FS04-11_CP3_A', 'FS05-15_CP3_A'
];
const SELECTION_PACK_01_NORMAL = [
  'FP-014_SP1', 'FP-015_SP1', 'FP-016_SP1', 'FP-022_SP1', 'FP-023_SP1'
];
const SELECTION_PACK_01_ALT = [
  'FP-014_SP1_A', 'FP-015_SP1_A', 'FP-016_SP1_A', 'FP-022_SP1_A', 'FP-023_SP1_A'
];
const TROPHY_FINALS_24 = [
  'FB01-129_TR1', 'FB01-129_TR2', 'FB01-129_TR3'
];
const TROPHY_GRAND_FINALS_24 = [
  'FP-034_TR1', 'FP-034_TR2', 'FP-034_TR3'
];
const ANNIVERSARY_SET_2025 = [
  'FB01-004_AS', 'FB02-018_AS', 'FB04-033_AS', 'FS02-15_AS', 'FB01-078_AS', 
  'FS03-16_AS', 'FB02-119_AS', 'FS04-11_AS', 'FB03-125_AS', 'FB04-104_AS', 
  'FB01-007_AS', 'FS02-10_AS', 'FB04-068_AS', 'FB05-074_AS', 'FB03-127_AS'
];

const ANNIVERSARY_SET_2026 = ['FP-075_AS2', 'FP-076_AS2', 'FP-079_AS2_W', 'FP-080_AS2_W', 'FP-081_AS2_W'];

const ULTIMATE_BATTLE_2024_V1 = ['FB01-096_UB_W', 'FS04-12_UB_T8'];
const ULTIMATE_BATTLE_2024_V2 = ['FB02-007_UB_V2_T8', 'FB02-061_UB_V2_W'];
const BCG_FEST_24 = ['FB03-011_BCGF'];

const PACK_ARRAYS: Record<string, string[]> = {
  EP01: EVENT_PACK_01, EP02: EVENT_PACK_02, EP03: EVENT_PACK_03, EP04: EVENT_PACK_04, EP05: EVENT_PACK_05, EP06: EVENT_PACK_06, EP07: EVENT_PACK_07, EP08: EVENT_PACK_08, EP09: EVENT_PACK_09, EP10: EVENT_PACK_10, EP11: EVENT_PACK_11, EP12: EVENT_PACK_12, EP13: EVENT_PACK_13, EP14: EVENT_PACK_14, EP15: EVENT_PACK_15, EP16: EVENT_PACK_16, EP17: EVENT_PACK_17, EP18: EVENT_PACK_18,
  JP01: JUDGE_PACK_01, JP02: JUDGE_PACK_02, JP03: JUDGE_PACK_03, JP04: JUDGE_PACK_04, JP05: JUDGE_PACK_05, JP06: JUDGE_PACK_06, JP07: JUDGE_PACK_07, JP08: JUDGE_PACK_08, JP09: JUDGE_PACK_09, JP10: JUDGE_PACK_10, JP11: JUDGE_PACK_11, JP12: JUDGE_PACK_12, JP13: JUDGE_PACK_13, JP14: JUDGE_PACK_14, JP15: JUDGE_PACK_15, JP16: JUDGE_PACK_16, JP17: JUDGE_PACK_17, JP18: JUDGE_PACK_18,
  TP01: [...TOURNAMENT_PACK_01_NORMAL, ...TOURNAMENT_PACK_01_WINNER],
  TP02: [...TOURNAMENT_PACK_02_NORMAL, ...TOURNAMENT_PACK_02_WINNER],
  TP03: [...TOURNAMENT_PACK_03_NORMAL, ...TOURNAMENT_PACK_03_WINNER],
  TP04: [...TOURNAMENT_PACK_04_NORMAL, ...TOURNAMENT_PACK_04_WINNER],
  TP05: [...TOURNAMENT_PACK_05_NORMAL, ...TOURNAMENT_PACK_05_WINNER],
  TP06: [...TOURNAMENT_PACK_06_NORMAL, ...TOURNAMENT_PACK_06_WINNER],
  TP07: [...TOURNAMENT_PACK_07_NORMAL, ...TOURNAMENT_PACK_07_WINNER],
  TP08: [...TOURNAMENT_PACK_08_NORMAL, ...TOURNAMENT_PACK_08_WINNER],
  TP09: [...TOURNAMENT_PACK_09_NORMAL, ...TOURNAMENT_PACK_09_WINNER],
  TP10: TOURNAMENT_PACK_10_NORMAL,
  TP01_NORMAL_VIEW: TOURNAMENT_PACK_01_NORMAL,
  TP01_WINNER_VIEW: TOURNAMENT_PACK_01_WINNER,
  TP02_NORMAL_VIEW: TOURNAMENT_PACK_02_NORMAL,
  TP02_WINNER_VIEW: TOURNAMENT_PACK_02_WINNER,
  TP03_NORMAL_VIEW: TOURNAMENT_PACK_03_NORMAL,
  TP03_WINNER_VIEW: TOURNAMENT_PACK_03_WINNER,
  TP04_NORMAL_VIEW: TOURNAMENT_PACK_04_NORMAL,
  TP04_WINNER_VIEW: TOURNAMENT_PACK_04_WINNER,
  TP05_NORMAL_VIEW: TOURNAMENT_PACK_05_NORMAL,
  TP05_WINNER_VIEW: TOURNAMENT_PACK_05_WINNER,
  TP06_NORMAL_VIEW: TOURNAMENT_PACK_06_NORMAL,
  TP06_WINNER_VIEW: TOURNAMENT_PACK_06_WINNER,
  TP07_NORMAL_VIEW: TOURNAMENT_PACK_07_NORMAL,
  TP07_WINNER_VIEW: TOURNAMENT_PACK_07_WINNER,
  TP08_NORMAL_VIEW: TOURNAMENT_PACK_08_NORMAL,
  TP08_WINNER_VIEW: TOURNAMENT_PACK_08_WINNER,
  TP09_NORMAL_VIEW: TOURNAMENT_PACK_09_NORMAL,
  TP09_WINNER_VIEW: TOURNAMENT_PACK_09_WINNER,
  TP10_NORMAL_VIEW: TOURNAMENT_PACK_10_NORMAL,
  UB_2024_V1: ULTIMATE_BATTLE_2024_V1,
  UB_2024_V2: ULTIMATE_BATTLE_2024_V2,
  UB_2024_V3: ULTIMATE_BATTLE_2024_V3,
  'UB25-1': ULTIMATE_BATTLE_2025_V1,
  'UB25-2': ULTIMATE_BATTLE_2025_V2,
  'UB25-4': ULTIMATE_BATTLE_2025_V4,
  'UB25-5': ULTIMATE_BATTLE_2025_V5,
  'UB26-1': ULTIMATE_BATTLE_2026_V1,
  'UB26-2': ULTIMATE_BATTLE_2026_V2,
  'CH26_W1_FOLDER': [...LIMITED_PACK_26_01, ...CHAMPIONSHIP_2026_W1_TOP, 'PM-CH26-W1'],
  LP26_W1_VIEW: LIMITED_PACK_26_01,
  CH26_W1_TOP_VIEW: CHAMPIONSHIP_2026_W1_TOP,
  CH26_W1_ACC_VIEW: ['PM-CH26-W1'],
  BCG_FEST_24: BCG_FEST_24,
  CP01: [...CHAMPIONSHIP_PACK_01_NORMAL, ...CHAMPIONSHIP_PACK_01_ALT],
  CP01_NORMAL_VIEW: CHAMPIONSHIP_PACK_01_NORMAL,
  CP01_ALT_VIEW: CHAMPIONSHIP_PACK_01_ALT,
  CP02_NORMAL_VIEW: CHAMPIONSHIP_PACK_02_NORMAL,
  CP02_ALT_VIEW: CHAMPIONSHIP_PACK_02_ALT,
  CP03_NORMAL_VIEW: CHAMPIONSHIP_PACK_03_NORMAL,
  CP03_ALT_VIEW: CHAMPIONSHIP_PACK_03_ALT,
  SP01_NORMAL_VIEW: SELECTION_PACK_01_NORMAL,
  SP01_ALT_VIEW: SELECTION_PACK_01_ALT,
  TR_FINALS_24: TROPHY_FINALS_24,
  TR_GRAND_FINALS_24: TROPHY_GRAND_FINALS_24,
  '1ST_ANNIV_FOLDER': T1ST_ANNIV_EVENT,
  '40TH_ANNIV_FOLDER': T40TH_ANNIV_EVENT,
  '40TH_ANNIV_V2': ULTIMATE_BATTLE_2025_V5,
  '40TH_ANNIV_VOL1_FOLDER': [...T40TH_ANNIV_EVENT, ...LP01_NORMAL],
  '40TH_ANNIV_VOL2_FOLDER': [...ULTIMATE_BATTLE_2025_V5, ...LP02_NORMAL],
  '40TH_ANNIV_FOLDER_MAIN': [...T40TH_ANNIV_EVENT, ...LP01_NORMAL, ...ULTIMATE_BATTLE_2025_V5, ...LP02_NORMAL],
  'LP01_FOLDER': LP01_NORMAL,
  'LP02_FOLDER': LP02_NORMAL,
  'LP01': LP01_NORMAL,
  'LP02': LP02_NORMAL,
  'PCC01': PCC01_NORMAL,
  'PCC02': PCC02_NORMAL,
  'PREMIUM_COLLECTION_FOLDER': [...PCC01_NORMAL, ...PCC02_NORMAL],
  FP_RELEASE_FB01: ['FP-008_RE_FB01'],
  FP_RELEASE_FB02: ['FP-013_W_G'],
  FP_RELEASE_FB03: ['FP-021_RE_FB03'],
  FP_RELEASE_FB04: ['FP-027_RE_FB04_W'],
  FP_RELEASE_FB05: ['FP-034_RE_FB05'],
  FP_RELEASE_FB06: ['FP-041_RE_FB06'],
  FP_RELEASE_FB07: ['FP-050_RE_FB07'],
  FP_RELEASE_FB08: ['FP-068_RE_FB08'],
  FP_RELEASE_FB09: ['FP-077_RE_FB09'],
  RE_SB01_FOLDER: ['FP-049_RE_SB01'],
  RE_SB02_FOLDER: ['FP-062_RE_SB02'],
  FP_CELEBRATION: ['FP-006_CE_G', 'FP-007_CE_G', 'FS06-01_CE_G', 'FS07-01_CE_G'],
  FP_NY_COMIC_CON: ['FP-022_NY24'],
  AS2025: ANNIVERSARY_SET_2025,
  AS2026: ANNIVERSARY_SET_2026,
  CP_W1: ['FB02-133_RE', 'FB01-015_RE'],
  CP_W2: ['FB03-064_RE', 'FS05-11_RE'],
  CH2024_W1_FOLDER: [...CHAMPIONSHIP_PACK_01_NORMAL, ...CHAMPIONSHIP_PACK_01_ALT, 'FB02-133_RE', 'FB01-015_RE'],
  CH2024_W2_FOLDER: [...CHAMPIONSHIP_PACK_02_NORMAL, ...CHAMPIONSHIP_PACK_02_ALT, 'FB03-064_RE', 'FS05-11_RE'],
  CH2024_FINALS_FOLDER: [...CHAMPIONSHIP_PACK_03_NORMAL, ...CHAMPIONSHIP_PACK_03_ALT, ...SELECTION_PACK_01_NORMAL, ...SELECTION_PACK_01_ALT, ...TROPHY_FINALS_24],
  CH25_W1_FOLDER: [...LIMITED_PACK_25_01_NORMAL, ...LIMITED_PACK_25_01_WINNER, ...CHAMPIONSHIP_25_W1_TOP, ...CHAMPIONSHIP_25_W1_SERIAL, 'SL-CH25-W1', 'PM-CH25-W1'],
  LP25_01_NORMAL: LIMITED_PACK_25_01_NORMAL,
  LP25_01_WINNER: LIMITED_PACK_25_01_WINNER,
  CP25_W1_TOP: CHAMPIONSHIP_25_W1_TOP,
  CP25_W1_SERIAL: CHAMPIONSHIP_25_W1_SERIAL,
  ACC25_W1: ['SL-CH25-W1', 'PM-CH25-W1'],
  CH25_W2_FOLDER: [...LIMITED_PACK_25_02_NORMAL, ...LIMITED_PACK_25_02_WINNER, ...CHAMPIONSHIP_25_W2_TOP, 'SL-CH25-W2', 'PM-CH25-W2'],
  LP25_02_NORMAL: LIMITED_PACK_25_02_NORMAL,
  LP25_02_WINNER: LIMITED_PACK_25_02_WINNER,
  CP25_W2_TOP: CHAMPIONSHIP_25_W2_TOP,
  ACC25_W2: ['SL-CH25-W2', 'PM-CH25-W2'],
  CH25_FINALS_FOLDER: [...CHAMPIONSHIP_25_FINALS_TOP, ...CHAMPIONSHIP_25_FINALS_TROPHY, 'PM-CH-FINALS25'],
  CH25_FINALS_TOP: CHAMPIONSHIP_25_FINALS_TOP,
  CH25_FINALS_TROPHY: CHAMPIONSHIP_25_FINALS_TROPHY,
  CH25_FINALS_ACC: ['PM-CH-FINALS25'],
  CH25_GFINALS_FOLDER: [...CHAMPIONSHIP_25_GFINALS_TROPHY, 'PM-CH-GF25'],
  CH25_GFINALS_TROPHY: CHAMPIONSHIP_25_GFINALS_TROPHY,
  CH25_GFINALS_ACC: ['PM-CH-GF25'],
  'SL-CH-W1': ['SL-CH-W1'],
  'SL-CH-W2': ['SL-CH-W2'],
  'SL-CH25-W1': ['SL-CH25-W1'],
  'SL-CH25-W2': ['SL-CH25-W2'],
  'PM-CH-W1': ['PM-CH-W1'],
  'PM-CH-W2': ['PM-CH-W2'],
  'PM-CH25-W1': ['PM-CH25-W1'],
  'PM-CH25-W2': ['PM-CH25-W2'],
  'PM-CH-FINALS24': ['PM-CH-FINALS24'],
  'PM-CH-FINALS25': ['PM-CH-FINALS25'],
  'PM-CH-GF24': ['PM-CH-GF24'],
  'PM-CH-GF25': ['PM-CH-GF25'],
  'PM01': ['PM01'],
  'PM02': ['PM02'],
  'SL04': ['SL04'],
  'SL-ILL': ['SL-ILL'],
  'SL-ILL-SP': ['SL-ILL-SP'],
  'SL01': ['SL01'],
  'SL-LTD03-BULMA': ['SL-LTD03-BULMA'],
  'SL-LTD04-GOKU': ['SL-LTD04-GOKU'],
  'SL03': ['SL03'],
  'SL02': ['SL02'],
  'SL-LTD02-GOKU': ['SL-LTD02-GOKU'],
  'SL-LTD02-SHENRON': ['SL-LTD02-SHENRON'],
  'CC-BARDOCK': ['CC-BARDOCK'],
  'CC-BROLY': ['CC-BROLY'],
  'CC-VEGITO': ['CC-VEGITO'],
  'CC-GOGETA': ['CC-GOGETA'],
  'ACS02': ['ACS02'],
  'ACS01': ['ACS01'],
};

const getCardTags = (card: Card) => {
  const tags: string[] = [];
  const source = card.sourceProduct?.toLowerCase() || '';
  const id = card.id.toUpperCase();
  
  if (source.includes('event pack') || source.includes('event promo') || source.includes('release event') || id.includes('_EP') || id.includes('_RE') || 
      EVENT_PACK_01.includes(id) || EVENT_PACK_02.includes(id) || EVENT_PACK_03.includes(id) || 
      EVENT_PACK_04.includes(id) || EVENT_PACK_05.includes(id) || EVENT_PACK_06.includes(id) || 
      EVENT_PACK_07.includes(id) || EVENT_PACK_08.includes(id) || EVENT_PACK_09.includes(id) || 
      EVENT_PACK_10.includes(id) || EVENT_PACK_11.includes(id) || EVENT_PACK_12.includes(id) || 
      EVENT_PACK_13.includes(id) || EVENT_PACK_14.includes(id) || EVENT_PACK_15.includes(id) || 
      EVENT_PACK_16.includes(id) || EVENT_PACK_17.includes(id) || EVENT_PACK_18.includes(id)) tags.push('event');
      
  if (source.includes('tournament pack') || id.includes('_W') || id.includes('_TP')) tags.push('tournament');
  if (id.includes('_TP_W')) tags.push('winner');
  if (id.includes('_AS') || source.includes('anniversary') || id.includes('40TH') || source.includes('40th')) {
    tags.push('anniversary');
    tags.push('event');
  }
  if (id.includes('_CP') || source.includes('championship')) tags.push('championship');
  
  if (source.includes('judge pack') || source.includes('judge promo') || id.includes('_JP') || 
      JUDGE_PACK_01.includes(id) || JUDGE_PACK_02.includes(id) || JUDGE_PACK_03.includes(id) || 
      JUDGE_PACK_04.includes(id) || JUDGE_PACK_05.includes(id) || JUDGE_PACK_06.includes(id) || 
      JUDGE_PACK_07.includes(id) || JUDGE_PACK_08.includes(id) || JUDGE_PACK_09.includes(id) || 
      JUDGE_PACK_10.includes(id) || JUDGE_PACK_11.includes(id) || JUDGE_PACK_12.includes(id) || 
      JUDGE_PACK_13.includes(id) || JUDGE_PACK_14.includes(id) || JUDGE_PACK_15.includes(id)) tags.push('judge');
      
  if (source.includes('giant size') || id.includes('_GS')) tags.push('giant');
  if (source.includes('ultimate battle') || id.includes('_UB_')) tags.push('ultimate-battle');
  
  if (id.includes('_SE') || source.includes('serial') || ['BT22-138_PR', 'BT19-152_PR', 'BT27-139_PR', 'BT1-111_PR', 'BT1-111_PR02', 'BT27-019_PR', 'BT27-039_PR', 'BT27-059_PR', 'BT27-084_PR', 'BT27-095_PR'].includes(id)) tags.push('serial');
  
  if (id.startsWith('SL-')) tags.push('sleeve');
  if (id.startsWith('PM-')) tags.push('playmat');

  return tags;
};

const getDeduplicatedStats = (subsetCards: Card[], inventory: InventoryItem[], goal: 'collector' | 'player') => {
  const baseMap = new Map<string, { needed: number; owned: number }>();
  subsetCards.forEach(c => {
    const baseId = c.cardNumber.split('_')[0];
    const isAlt = isAlternative(c.id) && c.rarity !== 'SPR' && c.rarity !== 'GDR';
    const target = getTargetQuantity(c, goal);
    const invItem = inventory.find(i => i.cardId === c.id);
    const quantity = invItem ? invItem.quantity : 0;
    const ownedValue = Math.min(quantity, target);
    if (!baseMap.has(baseId)) {
      baseMap.set(baseId, { needed: isAlt ? 0 : target, owned: ownedValue });
    } else {
      const existing = baseMap.get(baseId)!;
      if (!isAlt && existing.needed === 0) existing.needed = target;
      existing.owned = Math.max(existing.owned, ownedValue);
    }
  });
  let total = 0;
  let owned = 0;
  baseMap.forEach(v => {
    total += v.needed;
    owned += v.owned;
  });
  return { total, owned };
};

const getTargetQuantity = (card: Card, goal: 'collector' | 'player') => {
  if (goal === 'collector') return 1;
  const isOneUnitOnly = 
    card.type.includes('Leader') || 
    card.id.includes('_SLR') || 
    card.type.includes('Marker') || 
    ['SCR', 'GDR', 'LEADER RARE'].includes(card.rarity);
  return isOneUnitOnly ? 1 : 4;
};

// Dynamic achievement generator
const getAchievementsList = (cards: Card[], groups: ExpansionGroup[], gameType: 'masters' | 'fusion' = 'masters') => {
  if (gameType === 'fusion') {
    const fusionList: AchievementDef[] = [
      {
        id: 'fw_journey_begins',
        category: 'General',
        icon: 'Sparkles',
        title: { es: 'Tu camino comienza', en: 'Your journey begins' },
        description: { es: 'Consigue tu primera carta de Fusion World.', en: 'Obtain your first Fusion World card.' },
        type: 'unique',
        check: (cards, inventory) => {
          const owned = inventory.some(i => i.quantity > 0 && cards.some(c => c.id === i.cardId));
          return { earned: owned, progress: owned ? 100 : 0 };
        }
      },
      {
        id: 'fw_total_cards_milestone',
        category: 'General',
        icon: 'Library',
        title: { es: 'Explorador Fusion World', en: 'Fusion World Explorer' },
        description: { es: 'Consigue hitos de cartas únicas en Fusion World.', en: 'Reach unique card milestones in Fusion World.' },
        type: 'tiered',
        tiers: [
          { goal: 50, title: { es: 'Iniciación (50)', en: 'Initiation (50)' } },
          { goal: 150, title: { es: 'Coleccionista (150)', en: 'Collector (150)' } },
          { goal: 300, title: { es: 'Maestro FW (300)', en: 'FW Master (300)' } },
          { goal: 500, title: { es: 'Gran Maestro FW (500)', en: 'Grand FW Master (500)' } }
        ],
        check: (cards, inventory) => {
          const count = inventory.filter(i => i.quantity > 0 && cards.some(c => c.id === i.cardId)).length;
          const goals = [50, 150, 300, 500];
          let currentTier = -1;
          for (let i = 0; i < goals.length; i++) {
            if (count >= goals[i]) currentTier = i;
          }
          const nextGoal = goals[currentTier + 1] || goals[goals.length - 1];
          return { 
            earned: currentTier >= 0, 
            progress: Math.min((count / nextGoal) * 100, 100),
            tier: currentTier >= 0 ? currentTier : undefined
          };
        }
      }
    ];

    const rarityNames: Record<string, { es: string, en: string }> = {
      'L': { es: 'Líderes', en: 'Leaders' },
      'C': { es: 'Comunes', en: 'Commons' },
      'UC': { es: 'Infrecuentes', en: 'Uncommons' },
      'R': { es: 'Raras', en: 'Rares' },
      'SR': { es: 'Super Raras', en: 'Super Rares' },
      'SCR': { es: 'Secretas', en: 'Secret Rares' },
      'PR': { es: 'Promocionales', en: 'Promos' }
    };

    // Set completion for Fusion sets
    groups.forEach(group => {
      group.items.forEach(set => {
        const setCards = cards.filter(c => c.expansion === set.id);
        if (setCards.length === 0) return;

        // 100% Set Completion
        fusionList.push({
          id: `fw_set_completion_${set.id}`,
          category: 'Sets',
          icon: 'Package',
          title: { es: `Completar al 100%: ${set.id}`, en: `100% Completion: ${set.id}` },
          description: { es: `Colecciona todas las cartas de la expansión ${set.label}.`, en: `Collect all cards from the ${set.label} expansion.` },
          type: 'unique',
          check: (cards, inventory) => {
            const sc = cards.filter(c => c.expansion === set.id);
            if (sc.length === 0) return { earned: false, progress: 0 };
            const owned = sc.filter(s => inventory.some(i => i.cardId === s.id && i.quantity > 0)).length;
            const isDone = owned === sc.length && sc.length > 0;
            return { earned: isDone, progress: sc.length > 0 ? (owned / sc.length) * 100 : 0 };
          }
        });

        // Rarity Completion for this set
        ['L', 'C', 'UC', 'R', 'SR', 'SCR', 'PR'].forEach(rarity => {
          const rarityCards = setCards.filter(c => c.rarity === rarity || c.rarity === `${rarity}*`);
          if (rarityCards.length > 0) {
            fusionList.push({
              id: `fw_rarity_${set.id}_${rarity}`,
              category: set.label,
              icon: 'Award',
              title: { 
                es: `Colección ${rarityNames[rarity]?.es || rarity}: ${set.id}`, 
                en: `${rarityNames[rarity]?.en || rarity} Collection: ${set.id}` 
              },
              description: { 
                es: `Consigue todas las cartas de rareza ${rarityNames[rarity]?.es || rarity} de ${set.label}.`, 
                en: `Obtain all ${rarityNames[rarity]?.en || rarity} cards from ${set.label}.` 
              },
              type: 'unique',
              check: (cards, inventory) => {
                const rc = cards.filter(c => c.expansion === set.id && (c.rarity === rarity || c.rarity === `${rarity}*`));
                if (rc.length === 0) return { earned: false, progress: 0 };
                const owned = rc.filter(s => inventory.some(i => i.cardId === s.id && i.quantity > 0)).length;
                const isDone = owned === rc.length && rc.length > 0;
                return { earned: isDone, progress: rc.length > 0 ? (owned / rc.length) * 100 : 0 };
              }
            });
          }
        });
      });
    });

    return fusionList;
  }

  const list: AchievementDef[] = [
    {
      id: 'total_cards_milestone',
      category: 'General',
      icon: 'Library',
      title: { es: 'Hitos de Colección', en: 'Collection Milestones' },
      description: { es: 'Añade cartas únicas a tu colección.', en: 'Add unique cards to your collection.' },
      type: 'tiered',
      tiers: [
        { goal: 100, title: { es: 'Primeras 100', en: 'First 100' } },
        { goal: 250, title: { es: 'Colección Estable (250)', en: 'Steady Collection (250)' } },
        { goal: 500, title: { es: 'Veterano (500)', en: 'Veteran (500)' } },
        { goal: 1000, title: { es: 'Gran Maestro (1000)', en: 'Grand Master (1000)' } }
      ],
      check: (cards, inventory) => {
        const count = inventory.filter(i => i.quantity > 0 && cards.some(c => c.id === i.cardId)).length;
        const goals = [100, 250, 500, 1000];
        let currentTier = -1;
        for (let i = 0; i < goals.length; i++) {
          if (count >= goals[i]) currentTier = i;
        }
        const nextGoal = goals[currentTier + 1] || goals[goals.length - 1];
        return { 
          earned: currentTier >= 0, 
          progress: Math.min((count / nextGoal) * 100, 100),
          tier: currentTier >= 0 ? currentTier : undefined
        };
      }
    },
    {
      id: 'leader_milestone',
      category: 'General',
      icon: 'Medal',
      title: { es: 'Comandante de Líderes', en: 'Leader Commander' },
      description: { es: 'Consigue líderes únicos de todos los sets.', en: 'Collect unique leaders from all sets.' },
      type: 'tiered',
      tiers: [
        { goal: 10, title: { es: '10 Líderes', en: '10 Leaders' } },
        { goal: 25, title: { es: '25 Líderes', en: '25 Leaders' } },
        { goal: 50, title: { es: '50 Líderes', en: '50 Leaders' } },
        { goal: 100, title: { es: '100 Líderes', en: '100 Leaders' } }
      ],
      check: (cards, inventory) => {
        const count = inventory.filter(i => {
          const card = cards.find(c => c.id === i.cardId);
          return i.quantity > 0 && card && card.type.toLowerCase().includes('leader');
        }).length;
        const goals = [10, 25, 50, 100];
        let currentTier = -1;
        for (let i = 0; i < goals.length; i++) {
          if (count >= goals[i]) currentTier = i;
        }
        const nextGoal = goals[currentTier + 1] || goals[goals.length - 1];
        return { 
          earned: currentTier >= 0, 
          progress: Math.min((count / nextGoal) * 100, 100),
          tier: currentTier >= 0 ? currentTier : undefined
        };
      }
    },
    {
      id: 'scr_milestone',
      category: 'General',
      icon: 'Star',
      title: { es: 'Buscador de Secretas', en: 'Secret Seeker' },
      description: { es: 'Colecciona las cartas más raras del juego.', en: 'Collect the rarest cards in the game.' },
      type: 'tiered',
      hidden: true,
      tiers: [
        { goal: 1, title: { es: 'Tu Primera SCR', en: 'Your First SCR' } },
        { goal: 5, title: { es: 'Elite SCR (5)', en: 'Elite SCR (5)' } },
        { goal: 10, title: { es: 'Maestro de Secretas (10)', en: 'Secret Master (10)' } },
        { goal: 25, title: { es: 'Coleccionista SCR (25)', en: 'SCR Collector (25)' } },
        { goal: 50, title: { es: 'Omnipotente (50)', en: 'Omnipotent (50)' } }
      ],
      check: (cards, inventory) => {
        const count = inventory.filter(i => {
          const card = cards.find(c => c.id === i.cardId);
          return i.quantity > 0 && card && card.rarity === 'SCR';
        }).length;
        const goals = [1, 5, 10, 25, 50];
        let currentTier = -1;
        for (let i = 0; i < goals.length; i++) {
          if (count >= goals[i]) currentTier = i;
        }
        const nextGoal = goals[currentTier + 1] || goals[goals.length - 1];
        return { 
          earned: currentTier >= 0, 
          progress: Math.min((count / nextGoal) * 100, 100),
          tier: currentTier >= 0 ? currentTier : undefined
        };
      }
    },
    {
      id: 'gdr_milestone',
      category: 'General',
      icon: 'Zap',
      title: { es: 'Cazador de God Rares', en: 'God Rare Hunter' },
      description: { es: 'Consigue la rareza máxima: God Rare.', en: 'Collect the ultimate rarity: God Rare.' },
      type: 'tiered',
      hidden: true,
      tiers: [
        { goal: 1, title: { es: 'Primera GDR', en: 'First GDR' } },
        { goal: 5, title: { es: 'Iluminado (5)', en: 'Enlightened (5)' } },
        { goal: 10, title: { es: 'Avatar de los Dioses (10)', en: 'Avatar of the Gods (10)' } },
        { goal: 25, title: { es: 'Poder Infinito (25)', en: 'Infinite Power (25)' } },
        { goal: 50, title: { es: 'Creador de Universos (50)', en: 'Creator of Universes (50)' } }
      ],
      check: (cards, inventory) => {
        const count = inventory.filter(i => {
          const card = cards.find(c => i.cardId === c.id);
          return i.quantity > 0 && card && card.rarity === 'GDR';
        }).length;
        const goals = [1, 5, 10, 25, 50];
        let currentTier = -1;
        for (let i = 0; i < goals.length; i++) {
          if (count >= goals[i]) currentTier = i;
        }
        const nextGoal = goals[currentTier + 1] || goals[goals.length - 1];
        return { 
          earned: currentTier >= 0, 
          progress: Math.min((count / nextGoal) * 100, 100),
          tier: currentTier >= 0 ? currentTier : undefined
        };
      }
    },
    {
      id: 'ultimate_god_hunter',
      category: 'General',
      icon: 'Zap',
      title: { es: 'Elegido de los Dioses', en: 'Chosen of the Gods' },
      description: { es: 'Consigue TODAS las God Rares de la base de datos.', en: 'Collect ALL God Rares in the database.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const gdrCards = cards.filter(c => c.rarity === 'GDR');
        if (gdrCards.length === 0) return { earned: false, progress: 0 };
        const owned = gdrCards.filter(c => inventory.some(i => i.cardId === c.id && i.quantity > 0));
        return { earned: owned.length === gdrCards.length && gdrCards.length > 0, progress: (owned.length / gdrCards.length) * 100 };
      }
    },
    {
      id: 'puzzle_hunt_treasure',
      category: 'General',
      icon: 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-005.png',
      title: { es: 'Búsqueda del tesoro', en: 'Treasure Hunt' },
      description: { es: 'Has encontrado la carta secreta de la Anime Expo 2017: Trunks P-005.', en: 'You have found the secret card from Anime Expo 2017: Trunks P-005.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const isOwned = inventory.some(i => i.cardId === 'P-005_PR' && i.quantity > 0);
        return { earned: isOwned, progress: isOwned ? 100 : 0 };
      }
    },
    {
      id: 'battle_specialist',
      category: 'General',
      icon: 'Sword',
      title: { es: 'Especialista de Combate', en: 'Battle Specialist' },
      description: { es: 'Consigue 5 cartas únicas de tipo Battle.', en: 'Collect 5 unique Battle type cards.' },
      type: 'unique',
      check: (cards, inventory) => {
        const uniqueOwnedBattleCards = inventory.filter(i => {
          const card = cards.find(c => c.id === i.cardId);
          return i.quantity > 0 && card && card.type.toLowerCase().includes('battle');
        });
        const uniqueCount = uniqueOwnedBattleCards.length;
        const progress = Math.min((uniqueCount / 5) * 100, 100);
        return { earned: uniqueCount >= 5, progress };
      }
    },
    {
      id: 'lone_wolf_desert',
      category: 'General',
      icon: '/assets/achievements/yamcha.jpg',
      title: { es: 'El Lobo Solitario del Desierto', en: 'Lone Wolf of the Desert' },
      description: { es: 'Consigue los dos líderes Yamcha de BT5 y BT10.', en: 'Collect both Yamcha leaders from BT5 and BT10.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const yamchaIds = ['BT5-001', 'BT10-001'];
        const owned = inventory.filter(i => yamchaIds.includes(i.cardId) && i.quantity > 0);
        return { earned: owned.length === yamchaIds.length, progress: (owned.length / yamchaIds.length) * 100 };
      }
    },
    {
      id: 'turtle_school_master',
      category: 'General',
      icon: '/assets/achievements/masterroshi.jpg',
      title: { es: 'Turtle School', en: 'Turtle School' },
      description: { es: 'Consigue el líder Master Roshi de BT18.', en: 'Collect the Master Roshi leader from BT18.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const roshiId = 'BT18-059';
        const isOwned = inventory.some(i => i.cardId === roshiId && i.quantity > 0);
        return { earned: isOwned, progress: isOwned ? 100 : 0 };
      }
    },
    {
      id: 'dragon_ball_history',
      category: 'General',
      icon: '/assets/achievements/oolong.jpg',
      title: { es: 'Historia de Dragon Ball', en: 'Dragon Ball History' },
      description: { es: 'Consigue las 7 cartas de rareza DBR (History of Dragon Ball).', en: 'Collect the 7 DBR rarity cards (History of Dragon Ball).' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const dbrCards = cards.filter(c => c.rarity === 'DBR');
        const dbrIds = dbrCards.map(c => c.id);
        const owned = inventory.filter(i => dbrIds.includes(i.cardId) && i.quantity > 0);
        if (dbrIds.length === 0) return { earned: false, progress: 0 };
        return { earned: owned.length >= dbrIds.length, progress: Math.min((owned.length / dbrIds.length) * 100, 100) };
      }
    },
    {
      id: 'kefla_fanatic',
      category: 'General',
      icon: '/assets/achievements/kefla.jpg',
      title: { es: 'Keflaaaaaa', en: 'Keflaaaaaa' },
      description: { es: 'Consigue los 4 líderes de Kefla: P-184, EX3-01, BT7-075 y BT23-100.', en: 'Collect the 4 Kefla leaders: P-184, EX3-01, BT7-075 and BT23-100.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const keflaIds = ['P-184', 'EX3-01', 'BT7-075', 'BT23-100'];
        const owned = inventory.filter(i => keflaIds.includes(i.cardId) && i.quantity > 0);
        return { earned: owned.length === keflaIds.length, progress: (owned.length / keflaIds.length) * 100 };
      }
    },
    {
      id: 'how_it_started',
      category: 'General',
      icon: '/assets/achievements/gokubulma.jpg',
      title: { es: 'Así empezó todo', en: 'How it all started' },
      description: { es: 'Consigue el líder Goku & Bulma (BT27-044 o SLR) y la carta Extra "Start of a Journey" (BT27-060).', en: 'Collect the Goku & Bulma leader (BT27-044 or SLR) and the Extra card "Start of a Journey" (BT27-060).' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const hasLeader = inventory.some(i => (i.cardId === 'BT27-044' || i.cardId === 'BT27-044_SLR') && i.quantity > 0);
        const hasExtra = inventory.some(i => i.cardId === 'BT27-060' && i.quantity > 0);
        const count = (hasLeader ? 1 : 0) + (hasExtra ? 1 : 0);
        return { earned: hasLeader && hasExtra, progress: (count / 2) * 100 };
      }
    },
    {
      id: 'started_with_you',
      category: 'General',
      icon: '/assets/achievements/comingsoon.png',
      title: { es: 'Contigo empezó todo', en: 'It all started with you' },
      description: { es: 'Consigue la primera carta que existió del juego: el líder Son Goku Promo (BT1-030_PR).', en: 'Collect the first card that ever existed: the promo Son Goku leader (BT1-030_PR).' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const isOwned = inventory.some(i => i.cardId === 'BT1-030_PR' && i.quantity > 0);
        return { earned: isOwned, progress: isOwned ? 100 : 0 };
      }
    },
    {
      id: 'kruskalf_fan',
      category: 'General',
      icon: '/assets/achievements/kruskalf.jpg',
      title: { es: 'Kruskalf', en: 'Kruskalf' },
      description: { es: 'Añade 10 o más unidades de la carta EX4-03.', en: 'Add 10 or more units of the card EX4-03.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        // Tolerant search for EX4-03 variants
        const item = inventory.find(i => {
          const id = i.cardId.replace(/^EX0+/, 'EX'); // Normalize EX04 to EX4
          return id === 'EX4-03' || id === 'EX4-003' || i.cardId === 'EX4-03' || i.cardId === 'EX04-03';
        });
        const quantity = item?.quantity || 0;
        if (quantity > 0) console.log(`[ACHIEVEMENT DEBUG] Kruskalf progress: ${quantity}/10 (Original CardId in inventory: ${item?.cardId})`);
        return { earned: quantity >= 10, progress: Math.min((quantity / 10) * 100, 100) };
      }
    },
    {
      id: 'nuclear_clown',
      category: 'General',
      icon: '/assets/achievements/belmod.jpg',
      title: { es: 'Payasada Nuclear', en: 'Nuclear Clown Business' },
      description: { es: 'Consigue las cartas BT28-106_SLR, BT28-150 y EX6-35.', en: 'Collect cards BT28-106_SLR, BT28-150 and EX6-35.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const reqIds = ['BT28-106_SLR', 'BT28-150', 'EX6-35'];
        const owned = inventory.filter(i => reqIds.includes(i.cardId) && i.quantity > 0);
        return { earned: owned.length === reqIds.length, progress: (owned.length / reqIds.length) * 100 };
      }
    },
    {
      id: 'tarraco_one',
      category: 'General',
      icon: '/assets/achievements/tarraco.jpg',
      title: { es: 'The Tarraco One', en: 'The Tarraco One' },
      description: { es: 'Consigue las cartas BT27-001_SLR, BT24-001_SLR, SD17-01 y BT30-001_SLR.', en: 'Collect cards BT27-001_SLR, BT24-001_SLR, SD17-01 and BT30-001_SLR.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const reqIds = ['BT27-001_SLR', 'BT24-001_SLR', 'SD17-01', 'ST17-01', 'BT30-001_SLR'];
        const owned = inventory.filter(i => reqIds.includes(i.cardId) && i.quantity > 0);
        // We count only unique matches in case both SD and ST exist (unlikely but safe)
        const uniqueMatches = new Set(owned.map(i => i.cardId.replace('SD', 'ST'))).size;
        const targetCount = 4; // BT27, BT24, (SD17/ST17), BT30
        return { earned: uniqueMatches >= targetCount, progress: (uniqueMatches / targetCount) * 100 };
      }
    },
    {
      id: 'serrano_style',
      category: 'General',
      icon: '/serranos.jpg',
      title: { es: 'Serrano Style', en: 'Serrano Style' },
      description: { es: 'Consigue un playset (4 copias) de una carta que tenga al menos 4 versiones alternativas además de la original.', en: 'Collect a playset (4 copies) of a card that has at least 4 alternative versions besides the original.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const cardGroups: Record<string, string[]> = {};
        cards.forEach(c => {
          const base = c.cardNumber.split('_')[0];
          if (!cardGroups[base]) cardGroups[base] = [];
          cardGroups[base].push(c.id);
        });

        const targetBases = Object.keys(cardGroups).filter(base => cardGroups[base].length >= 5);
        if (targetBases.length === 0) return { earned: false, progress: 0 };

        let maxProgress = 0;
        let earned = false;

        targetBases.forEach(base => {
          const ids = cardGroups[base];
          const totalOwned = inventory
            .filter(i => ids.includes(i.cardId))
            .reduce((sum, i) => sum + i.quantity, 0);
          
          const progress = Math.min((totalOwned / 4) * 100, 100);
          if (progress > maxProgress) maxProgress = progress;
          if (totalOwned >= 4) earned = true;
        });

        return { earned, progress: maxProgress };
      }
    },
    {
      id: 'picolansa_campero',
      category: 'General',
      icon: '/Chilled.jpg',
      title: { es: 'Picolansa el campero', en: 'Picolansa the Camper' },
      description: { es: 'Completa el playset (4 copias) de BT13-088, BT13-085, BT13-087 y BT13-086.', en: 'Complete the playset (4 copies) of BT13-088, BT13-085, BT13-087 and BT13-086.' },
      type: 'unique',
      hidden: true,
      check: (cards, inventory) => {
        const reqIds = ['BT13-088', 'BT13-085', 'BT13-087', 'BT13-086'];
        const completedCount = reqIds.filter(id => {
          const item = inventory.find(i => i.cardId === id);
          return (item?.quantity || 0) >= 4;
        }).length;
        const progress = (completedCount / reqIds.length) * 100;
        return { earned: completedCount === reqIds.length, progress };
      }
    }
  ];

  const seenIds = new Set<string>(list.map(a => a.id));

  groups.forEach(group => {
    // Only process these groups
    if (!['Booster Box', 'Themed Booster', 'Evolution Booster', 'Draft Box', 'Starter Deck', 'Expert Deck', 'Expansion Set', 'Coleccionismo'].includes(group.category)) return;

    group.items.forEach(set => {
      // Logic to get cards for this set (including virtual sets from Coleccionismo)
      const getSetCards = (cards: Card[], setId: string) => {
        // We need a proper getCardTags that works with the current card
        const cardTagsCheck = (c: Card, targetSetId: string) => {
          const tags = getCardTags(c);
          if (targetSetId === 'COL02') return tags.includes('giant');
          if (targetSetId === 'COL08') return tags.includes('serial');
          if (targetSetId === 'COL05') return tags.includes('event');
          if (targetSetId === 'COL06') return tags.includes('tournament');
          if (targetSetId === 'COL07') return tags.includes('judge');
          if (PACK_ARRAYS[targetSetId]) return PACK_ARRAYS[targetSetId].includes(c.id);
          if (c.expansion === targetSetId) return true;
          if (targetSetId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${targetSetId}`]?.includes(c.id)) return true;
          if (targetSetId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
          return false;
        };
        return cards.filter(c => cardTagsCheck(c, setId));
      };

      const setCards = getSetCards(cards, set.id);
      if (setCards.length === 0) return;

      const raritiesInSet = Array.from(new Set(setCards.map(c => c.rarity))).filter(Boolean);
      
      // Leaders and Rarities - Only for non-Expansion Sets and non-Coleccionismo
      if (group.category !== 'Expansion Set' && group.category !== 'Coleccionismo') {
        // Leaders
        const leaders = setCards.filter(c => c.type.toLowerCase().includes('leader'));
        if (leaders.length > 0) {
          const achId = `${set.id.toLowerCase()}_leaders`;
          if (!seenIds.has(achId)) {
            list.push({
              id: achId,
              category: group.category,
              subCategory: set.label,
              icon: 'Trophy',
              title: { es: `Líderes de ${set.id}`, en: `${set.id} Leaders` },
              description: { es: `Consigue todos los líderes del set ${set.id}.`, en: `Collect all leaders from ${set.id}.` },
              type: 'unique',
              check: (cards, inventory) => {
                const setLeaders = cards.filter(c => c.expansion === set.id && c.type.toLowerCase().includes('leader'));
                const owned = setLeaders.filter(l => inventory.some(i => i.cardId === l.id && i.quantity > 0));
                return { earned: owned.length === setLeaders.length && setLeaders.length > 0, progress: setLeaders.length > 0 ? (owned.length / setLeaders.length) * 100 : 0 };
              }
            });
            seenIds.add(achId);
          }
        }

        // Rarities
        raritiesInSet.forEach(r => {
          if (['C', 'UC', 'R', 'SR'].includes(r)) return; // Skip common ones to avoid spam
          
          const achId = `${set.id.toLowerCase()}_${r.toLowerCase()}_collector`;
          if (!seenIds.has(achId)) {
            list.push({
              id: achId,
              category: group.category,
              subCategory: set.label,
              icon: ['SPR', 'SCR', 'GDR', 'GFR', 'DR', 'DPR'].includes(r) ? 'Star' : 'Award',
              title: { es: `${set.id}: Rareza ${r}`, en: `${set.id}: Rarity ${r}` },
              description: { es: `Consigue todas las cartas ${r} de ${set.id}.`, en: `Collect all ${r} cards from ${set.id}.` },
              type: 'unique',
              check: (cards, inventory) => {
                const rCards = cards.filter(c => c.expansion === set.id && c.rarity === r);
                const owned = rCards.filter(l => inventory.some(i => i.cardId === l.id && i.quantity > 0));
                return { earned: owned.length === rCards.length && rCards.length > 0, progress: rCards.length > 0 ? (owned.length / rCards.length) * 100 : 0 };
              }
            });
            seenIds.add(achId);
          }
        });
      }

      // Base Set Achievement (Visible)
      const baseAchId = `${set.id.toLowerCase()}_complete_base`;
      if (!seenIds.has(baseAchId)) {
        list.push({
          id: baseAchId,
          category: group.category,
          subCategory: set.label,
          icon: 'Trophy',
          title: { es: `${set.id}: Set Base 100%`, en: `${set.id} Base Set 100%` },
          description: { es: `Completado el set base de ${set.label} (incluyendo SPR y GDR, sin variantes promo).`, en: `Completed ${set.label} base set (including SPR and GDR, excluding promo variants).` },
          type: 'unique',
          check: (cards, inventory) => {
            const cardTagsCheck = (c: Card, targetSetId: string) => {
              const tags = getCardTags(c);
              if (targetSetId === 'COL02') return tags.includes('giant');
              if (targetSetId === 'COL08') return tags.includes('serial');
              if (targetSetId === 'COL05') return tags.includes('event');
              if (targetSetId === 'COL06') return tags.includes('tournament');
              if (targetSetId === 'COL07') return tags.includes('judge');
              if (PACK_ARRAYS[targetSetId]) return PACK_ARRAYS[targetSetId].includes(c.id);
              if (c.expansion === targetSetId) return true;
              if (targetSetId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${targetSetId}`]?.includes(c.id)) return true;
              if (targetSetId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
              return false;
            };
            // Include cards from expansion but exclude those with alternate art suffixes (_PR, _PR01, etc)
            // For virtual sets, we don't exclude _PR as they ARE the content
            const isVirtual = isVirtualSet(set.id);
            const sCards = cards.filter(c => cardTagsCheck(c, set.id) && (isVirtual || !c.id.match(/_PR\d*$/) || c.rarity === 'SPR' || c.rarity === 'GDR'));
            const owned = sCards.filter(l => inventory.some(i => i.cardId === l.id && i.quantity > 0));
            return { earned: owned.length === sCards.length && sCards.length > 0, progress: sCards.length > 0 ? (owned.length / sCards.length) * 100 : 0 };
          }
        });
        seenIds.add(baseAchId);
      }

      // Master Set Achievement (Hidden)
      const masterAchId = `${set.id.toLowerCase()}_complete_master`;
      if (!seenIds.has(masterAchId)) {
        list.push({
          id: masterAchId,
          category: group.category,
          subCategory: set.label,
          icon: 'Crown',
          title: { es: `${set.id}: Maestro de Set`, en: `${set.id} Set Master` },
          description: { es: `Completado al 100% el set ${set.label} incluyendo TODAS las variantes alternativas.`, en: `100% completed ${set.label} set including ALL alternative variants.` },
          type: 'unique',
          hidden: true,
          check: (cards, inventory) => {
            const cardTagsCheck = (c: Card, targetSetId: string) => {
              const tags = getCardTags(c);
              if (targetSetId === 'COL02') return tags.includes('giant');
              if (targetSetId === 'COL08') return tags.includes('serial');
              if (targetSetId === 'COL05') return tags.includes('event');
              if (targetSetId === 'COL06') return tags.includes('tournament');
              if (targetSetId === 'COL07') return tags.includes('judge');
              if (PACK_ARRAYS[targetSetId]) return PACK_ARRAYS[targetSetId].includes(c.id);
              if (c.expansion === targetSetId) return true;
              if (targetSetId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${targetSetId}`]?.includes(c.id)) return true;
              if (targetSetId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
              return false;
            };
            const sCards = cards.filter(c => cardTagsCheck(c, set.id));
            const owned = sCards.filter(l => inventory.some(i => i.cardId === l.id && i.quantity > 0));
            return { earned: owned.length === sCards.length && sCards.length > 0, progress: sCards.length > 0 ? (owned.length / sCards.length) * 100 : 0 };
          }
        });
        seenIds.add(masterAchId);
      }
    });
  });

  // Promos: Special calculation for each 100 cards
  const promoCardsCount = cards.filter(c => c.expansion === 'FP').length;
  // Generate achievements for each 100 cards up to a reasonable limit (e.g., 1000 or total count)
  const maxPromoGoal = Math.max(1000, Math.ceil(promoCardsCount / 100) * 100);
  
  for (let goal = 100; goal <= maxPromoGoal; goal += 100) {
    list.push({
      id: `promo_count_${goal}`,
      category: 'Promos',
      icon: 'Layers',
      title: { es: `Coleccionista de Promos: ${goal}`, en: `Promo Collector: ${goal}` },
      description: { es: `Consigue ${goal} cartas promocionales únicas.`, en: `Collect ${goal} unique promo cards.` },
      type: 'unique',
      check: (cards, inventory) => {
        const ownedPromosCount = inventory.filter(inv => {
          const card = cards.find(c => c.id === inv.cardId);
          return inv.quantity > 0 && card && card.expansion === 'FP';
        }).length;
        const progress = Math.min((ownedPromosCount / goal) * 100, 100);
        return { earned: ownedPromosCount >= goal, progress };
      }
    });
  }

  return list;
};

const Dashboard = ({ 
  cards, 
  inventory, 
  collectionGoal, 
  lang, 
  recentlyAddedCards, 
  setSelectedCard,
  isMultiSelectMode,
  selectedCardIds,
  handleLongPress,
  toggleCardSelection,
  isInventoryLoading
}: { 
  cards: Card[], 
  inventory: InventoryItem[], 
  collectionGoal: 'collector' | 'player',
  lang: 'es' | 'en',
  recentlyAddedCards: Card[],
  setSelectedCard: (card: Card) => void,
  isMultiSelectMode: boolean,
  selectedCardIds: Set<string>,
  handleLongPress: (id: string) => void,
  toggleCardSelection: (id: string) => void,
  isInventoryLoading: boolean
}) => {
  const t = translations[lang];
  
  // Calculate completion based on goal
  const stats = useMemo(() => {
    let totalNeeded = 0;
    let totalOwned = 0;
    
    cards.forEach(c => {
      const target = getTargetQuantity(c, collectionGoal);
      const invItem = inventory.find(i => i.cardId === c.id);
      const quantity = invItem ? invItem.quantity : 0;
      const ownedValue = Math.min(quantity, target);

      totalNeeded += target;
      totalOwned += ownedValue;
    });

    return {
      totalNeeded,
      totalOwned,
      percentage: totalNeeded > 0 ? Math.round((totalOwned / totalNeeded) * 100) : 0
    };
  }, [cards, inventory, collectionGoal]);

  const chartData = [
    { name: t.completed, value: stats.totalOwned, color: '#FF8C00' },
    { name: t.remaining, value: Math.max(0, stats.totalNeeded - stats.totalOwned), color: '#2A2A2A' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Sponsor Banner */}
      <motion.a
        href="https://montalfan.com"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="block bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/10 relative overflow-hidden group shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/20 transition-all" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 italic">{t.sponsorLabel}</p>
          <img 
            src="/assets/montalfan.png" 
            alt="Montalfan Sponsor"
            className="h-10 object-contain mb-3 group-hover:scale-110 transition-transform duration-500"
          />
          <span className="text-white font-black text-lg tracking-tight uppercase group-hover:text-orange-400 transition-colors">{t.visitSponsor}</span>
        </div>
      </motion.a>

      {/* Main Progress Ring OR Empty State */}
      {isInventoryLoading ? (
        <div className="bg-[#1E1E1E] rounded-2xl p-16 shadow-xl flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mb-4"></div>
          <p className="text-orange-500/60 font-black animate-pulse">CARGANDO DATOS...</p>
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-[#1E1E1E] rounded-2xl p-8 shadow-xl border border-dashed border-orange-500/30 flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping opacity-50" />
            <Package size={36} className="text-orange-500 relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">¡Empieza tu Colección!</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-[280px]">
            {lang === 'es' 
              ? 'Tu colección está vacía. Usa el menú inferior para descubrir cartas y gestionar tu colección.' 
              : 'Your collection is empty. Use the bottom menu to discover cards and manage your collection.'}
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
              <Package size={20} className="text-cyan-500 mb-2" />
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{lang === 'es' ? 'Explora' : 'Browse'}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center border border-white/5 shadow-inner">
              <Search size={20} className="text-rose-500 mb-2" />
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{lang === 'es' ? 'Busca' : 'Search'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1E1E1E] rounded-2xl p-8 shadow-xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
          {/* Background Image with Opacity */}
          <img 
            src="/fondo portada.jpg"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-15"
            alt=""
          />
          <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent to-[#1E1E1E]/60" />
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 z-2" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-8 pt-4">
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1 italic">
                {lang === 'es' ? 'COLECCIÓN GLOBAL' : 'GLOBAL COLLECTION'}
              </h3>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                MODO: {collectionGoal === 'collector' ? t.collector : t.player}
              </p>
            </div>
            
            <div className="relative w-56 h-56 mb-4 group lowercase">
              <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-700" />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    strokeWidth={0}
                    startAngle={90}
                    endAngle={450}
                    cornerRadius={10}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="transition-all duration-500 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white italic leading-none drop-shadow-2xl">{stats.percentage}%</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">{t.completionProgress}</span>
              </div>
            </div>

            <div className="w-full flex justify-end mt-4">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-xl">
                  <Layers size={12} className="text-orange-500" />
                  <span className="text-[13px] font-black text-white uppercase tracking-tighter">
                    {stats.totalOwned} <span className="text-gray-500">/ {stats.totalNeeded}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mr-2">
                  <span className="text-xs font-black text-orange-400 italic leading-none">{cards.length}</span>
                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{t.cardsLabel}</span>
                </div>
              </div>
            </div>
            
            {/* Value section removed */}
          </div>
        </div>
      )}

      {/* Recently Added Section Moved Here */}
      {recentlyAddedCards.length > 0 && (
        <section className="space-y-4 px-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{t.recentAdded}</h3>
            <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-tighter shadow-lg shadow-orange-500/5">{t.last7days}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {recentlyAddedCards.map((card, idx) => (
              <CardItem 
                key={`${card.id}-${card.expansion}-${idx}`} 
                card={card} 
                quantity={inventory.find(i => i.cardId === card.id)?.quantity || 0}
                collectionGoal={collectionGoal}
                isSelected={selectedCardIds.has(card.id)}
                isMultiSelectMode={isMultiSelectMode}
                onLongPress={() => handleLongPress(card.id)}
                onSelect={() => toggleCardSelection(card.id)}
                onClick={() => setSelectedCard(card)} 
              />
            ))}
          </div>

        </section>
      )}
    </div>
  );
};

const CardStats = ({ cards, inventory, collectionGoal, lang, achievementsList, userAchievements, gameType, isInventoryLoading }: { 
  cards: Card[], 
  inventory: InventoryItem[], 
  collectionGoal: 'collector' | 'player',
  lang: 'es' | 'en',
  achievementsList: AchievementDef[],
  userAchievements: UserAchievement[],
  gameType: 'masters' | 'fusion',
  isInventoryLoading: boolean
}) => {
  const t = translations[lang];

  const achievementStats = useMemo(() => {
    const visible = achievementsList.filter(a => !a.hidden);
    const hidden = achievementsList.filter(a => a.hidden);
    
    const unlockedVisible = visible.filter(a => userAchievements.some(ua => ua.achievementId === a.id));
    const unlockedHidden = hidden.filter(a => userAchievements.some(ua => ua.achievementId === a.id));

    return {
      visibleTotal: visible.length,
      visibleUnlocked: unlockedVisible.length,
      hiddenTotal: hidden.length,
      hiddenUnlocked: unlockedHidden.length,
      total: achievementsList.length,
      unlockedTotal: userAchievements.filter(ua => achievementsList.some(def => def.id === ua.achievementId)).length
    };
  }, [achievementsList, userAchievements]);

  const achievementChartData = [
    { name: t.visibleAchievements, value: achievementStats.visibleUnlocked, color: '#F97316' },
    { name: t.hiddenAchievements, value: achievementStats.hiddenUnlocked, color: '#A855F7' },
    { name: t.remaining, value: Math.max(0, achievementStats.total - achievementStats.unlockedTotal), color: '#2A2A2A' }
  ];

  const rarityData = useMemo(() => {
    const validRarities = Array.from(new Set(cards.map(c => c.rarity)))
      .filter(r => r && r !== 'EP12');
    
    return validRarities.map(rarity => {
      const cardsOfRarity = cards.filter(c => c.rarity === rarity);
      const { total, owned } = getDeduplicatedStats(cardsOfRarity, inventory, collectionGoal);
      
      return {
        name: rarity,
        owned,
        total,
        percentage: total > 0 ? Math.round((owned / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [cards, inventory, collectionGoal]);

  const colorData = useMemo(() => {
    let validColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'Multi', 'White'];
    if (gameType === 'fusion') {
      validColors = validColors.filter(c => c !== 'Multi');
    }
    
    return validColors.map(color => {
      const cardsOfColor = cards.filter(c => c.color === color);
      const { total, owned } = getDeduplicatedStats(cardsOfColor, inventory, collectionGoal);
      
      return {
        name: color,
        owned,
        total,
        percentage: total > 0 ? Math.round((owned / total) * 100) : 0
      };
    }).filter(c => c.total > 0);
  }, [cards, inventory, collectionGoal, gameType]);

  const typeData = useMemo(() => {
    const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'Multi', 'White'];
    let effectiveCards = cards;
    if (gameType === 'fusion') {
      effectiveCards = cards.filter(c => c.color !== 'Multi');
    }

    
    const getEffectiveType = (card: Card) => {
      if (card.id.includes('_SLR')) return 'Leader Rare';
      return card.type;
    };

    const validTypes = Array.from(new Set(effectiveCards.map(getEffectiveType)))
      .filter(type => type && !colorNames.includes(type));

    return validTypes.map(type => {
      const cardsOfType = effectiveCards.filter(c => getEffectiveType(c) === type);
      const { total, owned } = getDeduplicatedStats(cardsOfType, inventory, collectionGoal);
      
      return {
        name: type,
        owned,
        total,
        percentage: total > 0 ? Math.round((owned / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [cards, inventory, collectionGoal, gameType]);

  return (
    <div className="space-y-8 pb-32">
      {isInventoryLoading ? (
        <div className="bg-[#1E1E1E] rounded-3xl p-16 shadow-xl flex flex-col items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mb-4"></div>
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-[#1E1E1E] rounded-3xl p-8 shadow-xl border border-dashed border-orange-500/30 flex flex-col items-center text-center opacity-80 mt-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <BarChart3 size={36} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sin datos disponibles</h3>
          <p className="text-gray-400 text-sm max-w-[280px]">
             {lang === 'es' ? 'Aún no hay datos que analizar. Empieza a añadir cartas a tu colección para ver estadísticas detalladas sobre su rareza, colores y tipos.' : 'No data available yet. Start adding cards to your collection to see detailed statistics on rarity, colors and types.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-[#1E1E1E] rounded-3xl p-6 shadow-xl border border-white/5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{t.colorProgress}</h3>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {colorData.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex flex-col">
                    <p className="text-xs font-black text-white italic uppercase tracking-tighter">
                      {(t as any).colorNames?.[stat.name] || stat.name}
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{stat.owned} / {stat.total}</p>
                  </div>
                  <p className={`text-xs font-black italic ${stat.percentage === 100 ? 'text-green-500' : 'text-orange-500'}`}>{stat.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-3xl p-6 shadow-xl border border-white/5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{t.distributionByType}</h3>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {typeData.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex flex-col">
                    <p className="text-xs font-black text-white italic uppercase tracking-tighter">
                      {(t as any).typeNames?.[stat.name] || stat.name}
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{stat.owned} / {stat.total}</p>
                  </div>
                  <p className={`text-xs font-black italic ${stat.percentage === 100 ? 'text-green-500' : 'text-orange-500'}`}>{stat.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="bg-[#1E1E1E] rounded-3xl p-6 shadow-xl border border-white/5">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{t.distributionByRarity}</h3>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {rarityData.map((stat) => (
            <div key={stat.name} className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex flex-col">
                <p className="text-xs font-black text-white italic uppercase tracking-tighter">{stat.name}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase">{stat.owned} / {stat.total}</p>
              </div>
              <p className={`text-xs font-black italic ${stat.percentage === 100 ? 'text-green-500' : 'text-orange-500'}`}>{stat.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Stats Section */}
      <div className="bg-[#1E1E1E] rounded-2xl p-6 shadow-xl border border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">{t.achievementStats}</h3>
        
        <div className="flex flex-col items-center">
          <div className="w-full h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={achievementChartData.filter(d => d.value > 0 || d.name === t.remaining)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {achievementChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pt-8">
              <Trophy size={20} className="text-orange-500 mb-1" />
              <p className="text-lg font-black text-white italic leading-none">{achievementStats.unlockedTotal}</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] font-black text-orange-500 uppercase mb-1">{t.visibleAchievements}</span>
              <p className="text-xl font-black text-white italic leading-tight">
                {achievementStats.visibleUnlocked}<span className="text-xs text-gray-600 font-bold">/{achievementStats.visibleTotal}</span>
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[8px] font-black text-purple-500 uppercase">{t.hiddenAchievements}</span>
                <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
              </div>
              <p className="text-xl font-black text-white italic leading-tight">
                {achievementStats.hiddenUnlocked}<span className="text-xs text-gray-600 font-bold">/{achievementStats.hiddenTotal}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FoilEffect = ({ rarity, mouseX = 0, mouseY = 0 }: { rarity: string, mouseX?: number, mouseY?: number }) => {
  const isHighRarity = ['SCR', 'GDR', 'LEADER RARE', 'SPR', 'SR', 'RLR', 'PRW'].includes(rarity) || rarity.includes('*');
  const isFoil = isHighRarity || rarity === 'R';
  
  if (!isFoil) return null;

  // Normalize mouse positions to 0-100% for background positioning
  const px = (mouseX + 1) * 50;
  const py = (mouseY + 1) * 50;

  // Rarity-based base configurations
  const config = {
    isR: rarity === 'R' || rarity === 'R*',
    isSR: rarity === 'SR' || rarity === 'SR*',
    isSPR: rarity === 'SPR',
    isSCR: rarity.startsWith('SCR'),
    isGDR: rarity === 'GDR',
    isAlt: rarity.includes('*')
  };

  // 1. R (Rare) - Simple silver sheen
  if (config.isR && !config.isAlt) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-30"
          style={{ 
            backgroundImage: `linear-gradient(${110 + mouseX * 20}deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${px}% ${py}%`,
            mixBlendMode: 'overlay' 
          }}
        />
      </div>
    );
  }

  // Fusion World / Parallel Alts - Shiny Rainbow (like SR or better)
  if (config.isAlt) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-50"
          style={{ 
            backgroundImage: `
              linear-gradient(${mouseX * 20}deg, 
                rgba(255,0,0,0.1) 0%, 
                rgba(255,255,0,0.1) 20%, 
                rgba(0,255,0,0.1) 40%, 
                rgba(0,255,255,0.1) 60%, 
                rgba(0,0,255,0.1) 80%, 
                rgba(255,0,255,0.1) 100%
              ),
              radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.4) 0%, transparent 40%)
            `,
            backgroundSize: '200% 200%',
            mixBlendMode: 'color-dodge'
          }}
        />
      </div>
    );
  }

  // 2. SR (Super Rare) - Metallic rainbow sheen
  if (config.isSR) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-40"
          style={{ 
            backgroundImage: `
              linear-gradient(${115 + mouseX * 30}deg, 
                rgba(255,0,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,255,0.1), rgba(0,0,255,0.1), rgba(255,0,255,0.1)
              ),
              linear-gradient(${110 + mouseX * 20}deg, transparent 45%, rgba(255,255,255,0.9) 50%, transparent 55%)
            `,
            backgroundSize: '200% 200%, 200% 200%',
            backgroundPosition: `${px}% ${py}%, ${px}% ${py}%`,
            mixBlendMode: 'color-dodge' 
          }}
        />
      </div>
    );
  }

  // 3. SPR (Special Rare) - Defined texture + intense rainbow + shimmer
  if (config.isSPR) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-60"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.4) 0%, transparent 50%),
              linear-gradient(${120 + mouseX * 40}deg, 
                #ff000033, #ffff0033, #00ff0033, #00ffff33, #0000ff33, #ff00ff33
              )
            `,
            backgroundSize: '150% 150%, 200% 200%',
            backgroundPosition: `${px}% ${py}%, ${px}% ${py}%`,
            mixBlendMode: 'color-dodge' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
        />
      </div>
    );
  }

  // 4. SCR (Secret Rare) - Prismatic Holographic + Stars + Flares
  if (config.isSCR) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 opacity-80"
          style={{ 
            backgroundImage: `
              repeating-linear-gradient(${mouseX * 10}deg, 
                #ff000022 0%, #ffff0022 10%, #00ff0022 20%, #00ffff22 30%, #0000ff22 40%, #ff00ff22 50%
              ),
              radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.6) 0%, transparent 40%)
            `,
            backgroundSize: '400% 400%, 100% 100%',
            backgroundPosition: `${px}% ${py}%, center`,
            mixBlendMode: 'color-dodge',
            filter: 'contrast(1.2) brightness(1.2)'
          }}
        />
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen animate-pulse"
          style={{ 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
            backgroundSize: '100px 100px'
          }}
        />
      </div>
    );
  }

  // 5. GDR (God Rare) - Divine Gold/Crimson Glow + Intense Stardust + Power Pulse
  if (config.isGDR) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl border-2 border-yellow-500/30">
        <div
          className="absolute inset-0 opacity-90"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at ${px}% ${py}%, rgba(255, 215, 0, 0.4) 0%, rgba(255, 0, 0, 0.2) 30%, transparent 60%),
              linear-gradient(${115 + mouseX * 50}deg, 
                rgba(255, 215, 0, 0.1) 0%, 
                rgba(255, 255, 255, 0.4) 50%, 
                rgba(255, 215, 0, 0.1) 100%
              )
            `,
            backgroundSize: '150% 150%, 200% 200%',
            backgroundPosition: `${px}% ${py}%, ${px}% ${py}%`,
            mixBlendMode: 'color-dodge',
            filter: 'brightness(1.4) saturate(2) contrast(1.2)'
          }}
        />
        <div 
          className="absolute inset-0 opacity-50 mix-blend-overlay"
          style={{ 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
            filter: 'invert(1)'
          }}
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent mix-blend-screen"
        />
      </div>
    );
  }

  // Fallback for other foils (PRW, RLR, etc)
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
      <div
        className="absolute inset-0 opacity-40"
        style={{ 
          backgroundImage: `linear-gradient(${110 + mouseX * 20}deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)`,
          backgroundSize: '200% 200%',
          backgroundPosition: `${px}% ${py}%`,
          mixBlendMode: 'overlay' 
        }}
      />
    </div>
  );
};

const CardListItem = ({ 
  card, 
  quantity, 
  onClick, 
  collectionGoal, 
  lang,
  isSelected,
  isMultiSelectMode,
  onLongPress,
  onSelect
}: { 
  card: Card, 
  quantity?: number, 
  onClick: () => void, 
  collectionGoal: 'collector' | 'player', 
  lang: 'es' | 'en',
  isSelected?: boolean,
  isMultiSelectMode?: boolean,
  onLongPress?: () => void,
  onSelect?: () => void
}) => {
  const t = translations[lang];
  const isPlaymat = card.type === 'Playmat';
  const isOwned = quantity && quantity > 0;
  const target = getTargetQuantity(card, collectionGoal);
  const isPlaysetComplete = quantity && quantity >= target;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const handleMouseDown = () => {
    isLongPressActive.current = false;
    if (isMultiSelectMode) return;
    timerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      onLongPress?.();
    }, 500);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressActive.current = false;
      return;
    }
    
    if (isMultiSelectMode) {
      onSelect?.();
    } else {
      onClick();
    }
  };
  
  return (
    <motion.div
      whileHover={!isMultiSelectMode ? { x: 5 } : {}}
      whileTap={{ scale: 0.98 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`p-3 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all shadow-sm select-none ${
        isSelected 
          ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
          : isMultiSelectMode
            ? 'bg-white/5 border-white/10 opacity-70'
            : isOwned 
              ? (isPlaysetComplete ? 'bg-white border-green-100 hover:shadow-md' : 'bg-white border-orange-100 hover:shadow-md') 
              : 'bg-white border-gray-100 opacity-60 hover:shadow-md'
      }`}
    >
      <div className={`relative ${isPlaymat ? 'w-24 h-14' : 'w-12 h-16'} rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm bg-gray-50`}>
        <img 
          src={card.imageUrl || `https://picsum.photos/seed/${card.id}/400/600`} 
          alt={card.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover ${isOwned || isSelected ? 'grayscale-0' : 'grayscale'}`}
          referrerPolicy="no-referrer"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
            <CheckCircle2 className="text-white w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`font-black text-sm truncate ${isOwned ? 'text-gray-900' : 'text-gray-400'}`}>{card.name}</h4>
          {isOwned && collectionGoal === 'player' && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm ${isPlaysetComplete ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
              {quantity > target ? `${target}+` : `${quantity}/${target}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
            card.color === 'Red' ? 'bg-red-50 text-red-500' :
            card.color === 'Blue' ? 'bg-blue-50 text-blue-500' :
            card.color === 'Green' ? 'bg-green-50 text-green-500' :
            card.color === 'Yellow' ? 'bg-yellow-50 text-yellow-600' :
            card.color === 'Black' ? 'bg-gray-900 text-white' :
            card.color === 'Multi' ? 'bg-indigo-500 text-white' :
            card.color === 'White' ? 'bg-white text-gray-900 border border-gray-200' :
            'bg-gray-50 text-gray-500'
          }`}>
            {(t as any).colorNames?.[card.color] || card.color}
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase">
            {card.cardNumber} • {card.rarity.replace(/\*/g, '★')}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </motion.div>
  );
};

const ModalCard = ({ selectedCard, isFlipped, setIsFlipped }: { selectedCard: Card, isFlipped: boolean, setIsFlipped: (f: boolean) => void }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate for tilt (-5 to 5 degrees for modal, much subtler)
    setRotateX((centerY - y) / 8);
    setRotateY((x - centerX) / 8);
    
    setMouseX((x - centerX) / centerX);
    setMouseY((y - centerY) / centerY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setMouseX(0);
    setMouseY(0);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, y: 20 }}
      animate={{ 
        scale: 1, 
        y: 0,
        rotateY: isFlipped ? 180 + rotateY : rotateY,
        rotateX: rotateX
      }}
      transition={{ 
        type: "spring", 
        damping: 35, 
        stiffness: 70,
        rotateY: isFlipped ? { duration: 0.6 } : { type: "spring", damping: 35, stiffness: 70 }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${selectedCard.type === 'Playmat' ? 'aspect-video' : 'aspect-[63/88]'} rounded-xl shadow-2xl border border-white/10 relative group preserve-3d cursor-pointer bg-black/40`}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      onClick={() => selectedCard.type === 'Leader' && setIsFlipped(!isFlipped)}
    >
      {/* Front Side */}
      <div 
        className="absolute inset-0 backface-hidden rounded-xl overflow-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <img 
          src={selectedCard.imageUrl} 
          className="w-full h-full object-cover" 
          alt={selectedCard.name} 
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const isEnergyMarker = selectedCard.cardNumber.startsWith('E-') || selectedCard.cardNumber.startsWith('E01-') || selectedCard.cardNumber.startsWith('E02-') || selectedCard.cardNumber.startsWith('E03-') || selectedCard.cardNumber.startsWith('M-') || /^[EM]\d+/.test(selectedCard.cardNumber);
            if (isEnergyMarker) {
              target.src = 'https://static.fw.dbscards.fr/cards/common/back-energy.webp';
            }
          }}
        />
        
        {selectedCard.isFoil && (
          <FoilEffect rarity={selectedCard.rarity} mouseX={mouseX} mouseY={mouseY} />
        )}
      </div>

      {/* Back Side (for Leaders) */}
      {selectedCard.type === 'Leader' && (
        <div 
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <img 
            src={selectedCard.backImageUrl} 
            className="w-full h-full object-cover" 
            alt={`${selectedCard.name} (Back)`} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const isEnergyMarker = selectedCard.cardNumber.startsWith('E-') || selectedCard.cardNumber.startsWith('E01-') || selectedCard.cardNumber.startsWith('E02-') || selectedCard.cardNumber.startsWith('E03-') || selectedCard.cardNumber.startsWith('M-') || /^[EM]\d+/.test(selectedCard.cardNumber);
              if (isEnergyMarker) {
                target.src = 'https://static.fw.dbscards.fr/cards/common/back-energy.webp';
              }
            }}
          />
           {selectedCard.isFoil && (
            <FoilEffect rarity={selectedCard.rarity} mouseX={-mouseX} mouseY={mouseY} />
           )}
        </div>
      )}
    </motion.div>
  );
};

const CardItem = ({ 
  card, 
  quantity, 
  onClick, 
  collectionGoal,
  isSelected,
  isMultiSelectMode,
  onLongPress,
  onSelect
}: { 
  card: Card, 
  quantity?: number, 
  onClick: () => void, 
  collectionGoal: 'collector' | 'player',
  isSelected?: boolean,
  isMultiSelectMode?: boolean,
  onLongPress?: () => void,
  onSelect?: () => void
}) => {
  const isPlaymat = card.type === 'Playmat';
  const isOwned = quantity && quantity > 0;
  const target = getTargetQuantity(card, collectionGoal);
  const isPlaysetComplete = quantity && quantity >= target;
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMultiSelectMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (-3 to 3 degrees, very subtle)
    setRotateX((centerY - y) / 12);
    setRotateY((x - centerX) / 12);
    
    // Normalized position (-1 to 1) for the shine
    setMouseX((x - centerX) / centerX);
    setMouseY((y - centerY) / centerY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setMouseX(0);
    setMouseY(0);
    handleMouseUp();
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const handleMouseDown = () => {
    isLongPressActive.current = false;
    if (isMultiSelectMode) return;
    timerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      onLongPress?.();
    }, 500);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressActive.current = false;
      return;
    }
    
    if (isMultiSelectMode) {
      onSelect?.();
    } else {
      onClick();
    }
  };

  return (
    <motion.div
      animate={{ 
        rotateX, 
        rotateY,
        scale: isSelected ? 0.95 : (rotateX !== 0 ? 1.05 : 1),
        y: rotateX !== 0 ? -5 : 0
      }}
      transition={{ type: "spring", stiffness: 70, damping: 35 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative cursor-pointer group preserve-3d transition-all duration-300 select-none ${isSelected ? 'z-10' : ''} ${isPlaymat ? 'col-span-2' : ''}`}
    >
      <div className={`relative ${isPlaymat ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isSelected 
          ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-black shadow-[0_0_30px_rgba(249,115,22,0.3)]' 
          : 'ring-1 ring-white/10 group-hover:ring-white/30'
      }`}>
        <div className="relative w-full h-full overflow-hidden bg-[#1E1E1E]">
          <img 
            src={card.imageUrl || `https://picsum.photos/seed/${card.id}/400/600`} 
            alt={card.name}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const isEnergyMarker = card.cardNumber.startsWith('E-') || card.cardNumber.startsWith('E01-') || card.cardNumber.startsWith('E02-') || card.cardNumber.startsWith('E03-') || card.cardNumber.startsWith('M-') || /^[EM]\d+/.test(card.cardNumber);
              if (isEnergyMarker) {
                target.src = 'https://static.fw.dbscards.fr/cards/common/back-energy.webp';
              }
            }}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${
              isSelected || isOwned ? 'grayscale-0' : 'grayscale opacity-40'
            } ${isSelected ? 'brightness-125' : ''}`}
            referrerPolicy="no-referrer"
          />
          
          {(isOwned || isSelected) && card.isFoil && !isSelected && (
            <FoilEffect rarity={card.rarity} mouseX={mouseX} mouseY={mouseY} />
          )}

          {isSelected && (
            <div className="absolute inset-0 bg-orange-500/40 flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-white p-2 rounded-full shadow-2xl scale-125">
                <CheckCircle2 className="text-orange-500 w-6 h-6" />
              </div>
            </div>
          )}

          {/* Quantity indicator */}
          {!isMultiSelectMode && isOwned && collectionGoal === 'player' && (
            <div className={`absolute bottom-1 right-1 z-30 px-1.5 py-0.5 rounded shadow-lg text-[10px] font-black ${isPlaysetComplete ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
              {quantity > target ? `${target}+` : `${quantity}/${target}`}
            </div>
          )}

          {card.type === 'Leader' && (
            <div className="absolute top-1 left-1 z-20 bg-yellow-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm shadow-sm flex items-center gap-0.5">
              <RefreshCw size={8} />
              LEADER
            </div>
          )}

          {card.legalStatus && (
            <div className={`absolute top-1 right-1 z-40 w-3 h-3 rounded-full border border-white/20 shadow-lg ${
              card.legalStatus === 'Banned' ? 'bg-red-500' :
              card.legalStatus === 'Banned (BO1)' ? 'bg-orange-600' :
              card.legalStatus === 'Limited' ? 'bg-blue-500' :
              'bg-yellow-400'
            }`} />
          )}
        </div>
      </div>
    </motion.div>
  );
};


const CustomIcon = ({ src, active, size = 24 }: { src: string, active?: boolean, size?: number }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <img 
      src={src} 
      alt="icon" 
      className={`w-full h-full object-contain transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}
      onError={(e) => {
        // Fallback to a simple colored circle if image fails to load
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full rounded-full ${active ? 'bg-orange-500' : 'bg-white/20'}"></div>`;
      }}
      referrerPolicy="no-referrer"
    />
  </div>
);

const HomeIcon = (props: any) => <CustomIcon src="/assets/inicio.png" {...props} />;
const CollectionIcon = (props: any) => <CustomIcon src="/assets/coleccion.png" {...props} />;
const StatsIcon = (props: any) => <CustomIcon src="/assets/stats.png" {...props} />;
const ProfileIcon = (props: any) => <CustomIcon src="/assets/perfil.png" {...props} />;
const SearchIcon = (props: any) => <CustomIcon src="/assets/buscar.png" {...props} />;

  const Navbar = ({ activeTab, handleTabChange, lang }: { 
    activeTab: string, 
    handleTabChange: (t: string) => void,
    lang: 'es' | 'en'
  }) => {
    const t = translations[lang];
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E]/90 backdrop-blur-xl border-t border-white/5 px-6 py-3 z-50 flex justify-between items-center max-w-md mx-auto rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] sm:max-w-none sm:rounded-none">
        {[
          { id: 'home', icon: HomeIcon, label: t.home },
          { id: 'collection', icon: CollectionIcon, label: t.collection },
          { id: 'search', icon: SearchIcon, label: t.search },
          { id: 'stats', icon: StatsIcon, label: t.stats },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tour-nav-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-orange-500' : 'text-white/70'}`}
          >
            <div className={`transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
              <tab.icon size={28} active={activeTab === tab.id} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    );
  };


const IconRenderer = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = { Trophy, Medal, Award, Layers, Star, Zap, Sword, Search };
  const [isLoaded, setIsLoaded] = useState(false);
  
  if (name.startsWith('/') || name.includes('.')) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Lighter placeholder to avoid harsh orange flash */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <img 
          src={name} 
          alt="icon" 
          onLoad={() => setIsLoaded(true)}
          className={`${className} w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const IconComponent = icons[name] || Trophy;
  return <IconComponent size={size} className={className} />;
};

type QueuedAchievement = {
  def: AchievementDef;
  tier?: number;
};

const AchievementUnlockPopup = ({ event, lang, onDone }: { event: QueuedAchievement, lang: 'es' | 'en', onDone: () => void }) => {
  const t = translations[lang];
  const { def, tier } = event;
  
  useEffect(() => {
    // Standard duration for a notification
    const timer = setTimeout(() => {
      onDone();
    }, 5000);
    return () => clearTimeout(timer);
  }, [def.id, tier, onDone]);

  const displayTitle = (def.type === 'tiered' && tier !== undefined && def.tiers && def.tiers[tier])
    ? def.tiers[tier].title[lang]
    : def.title[lang];

  return (
    <motion.div
      key={`${def.id}-${tier ?? 'base'}`}
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 20, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.5 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) {
          onDone();
        }
      }}
      whileDrag={{ scale: 1.05 }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-sm cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 db-glow-orange relative overflow-hidden">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <IconRenderer name={def.icon} size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none mb-1">{t.achievementUnlocked}</p>
          <h4 className="text-sm font-black text-white uppercase tracking-tight">{displayTitle}</h4>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const AchievementBadge = ({ achievement, userAchievement, lang, onClick }: { 
  achievement: AchievementDef, 
  userAchievement?: UserAchievement, 
  lang: 'es' | 'en',
  onClick: () => void 
}) => {
  const isUnlocked = !!userAchievement;
  const isSecret = achievement.hidden && !isUnlocked;
  const currentTier = userAchievement?.currentTier || 0;
  const tierInfo = achievement.tiers?.[currentTier];
  const t = translations[lang];

  const isImageIcon = !isSecret && (achievement.icon.startsWith('/') || achievement.icon.includes('.'));

  return (
    <motion.button
      whileHover={{ scale: isSecret ? 1 : 1.05 }}
      whileTap={{ scale: isSecret ? 1 : 0.95 }}
      onClick={isSecret ? undefined : onClick}
      className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
        isUnlocked 
          ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)]' 
          : isSecret 
            ? 'bg-black/20 border-white/5 opacity-80 cursor-default'
            : 'bg-white/5 border-white/5 grayscale opacity-40'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl transition-all duration-500 flex items-center justify-center overflow-hidden ${
        isUnlocked ? (isImageIcon ? 'bg-orange-500/50' : 'bg-orange-500') + ' text-white db-glow-orange scale-110 shadow-lg' : isSecret ? 'bg-gray-900 text-gray-700' : 'bg-gray-800 text-gray-500'
      } ${isImageIcon ? 'p-0' : 'p-3'}`}>
        <IconRenderer name={isSecret ? 'Search' : achievement.icon} size={24} />
      </div>
      <span className={`text-[10px] font-black uppercase text-center leading-tight transition-colors ${
        isUnlocked ? 'text-white' : 'text-gray-500'
      }`}>
        {isSecret ? t.secretAchievement : (tierInfo ? tierInfo.title[lang] : achievement.title[lang])}
      </span>
      {achievement.type === 'tiered' && isUnlocked && (
        <div className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white/20 shadow-lg">
          Lvl {currentTier + 1}
        </div>
      )}
    </motion.button>
  );
};

const AchievementsView = ({ 
  cards,
  inventory,
  userAchievements,
  lang, 
  onBack,
  groups
}: { 
  cards: Card[],
  inventory: InventoryItem[],
  userAchievements: UserAchievement[],
  lang: 'es' | 'en',
  onBack: () => void,
  groups: ExpansionGroup[]
}) => {
  const t = translations[lang];
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDef | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['General', 'Booster Box']);
  const [expandedSets, setExpandedSets] = useState<string[]>([]);

  const achievementsList = useMemo(() => getAchievementsList(cards, groups), [cards, groups]);

  const validUserAchievements = useMemo(() => {
    return userAchievements.filter(ua => achievementsList.some(def => def.id === ua.achievementId));
  }, [userAchievements, achievementsList]);

  const unlockedCount = validUserAchievements.length;
  const totalCount = achievementsList.length;

  // Group achievements by category AND subCategory
  const groupedAchievements = useMemo(() => {
    const categoriesOrder = ['General', 'Booster Box', 'Themed Booster', 'Evolution Booster', 'Draft Box', 'Starter Deck', 'Expert Deck', 'Expansion Set', 'Promos'];
    const results: { name: string; subs: { name?: string; achievements: AchievementDef[] }[] }[] = [];
    
    categoriesOrder.forEach(catName => {
      const allInCategory = achievementsList.filter(a => 
        a.category === catName && 
        (!a.hidden || validUserAchievements.some(ua => ua.achievementId === a.id))
      );
      if (allInCategory.length > 0) {
        const subMap = new Map<string, AchievementDef[]>();
        const noSub: AchievementDef[] = [];

        allInCategory.forEach(a => {
          if (a.subCategory) {
            const list = subMap.get(a.subCategory) || [];
            list.push(a);
            subMap.set(a.subCategory, list);
          } else {
            noSub.push(a);
          }
        });

        const subs: { name?: string; achievements: AchievementDef[] }[] = [];
        if (noSub.length > 0) subs.push({ achievements: noSub });
        
        Array.from(subMap.keys()).sort().forEach(subName => {
          subs.push({ name: subName, achievements: subMap.get(subName)! });
        });

        results.push({ name: catName, subs });
      }
    });

    return results;
  }, [achievementsList]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-white uppercase italic">{t.achievements}</h2>
          <div className="flex items-center gap-2">
            <Trophy size={10} className="text-orange-500" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
              {unlockedCount} / {totalCount} COMPLETADOS
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupedAchievements.map(cat => {
          const isCatExpanded = expandedCategories.includes(cat.name);
          const totalInCat = cat.subs.reduce((acc, s) => acc + s.achievements.length, 0);
          const unlockedInCat = cat.subs.reduce((acc, s) => acc + s.achievements.filter(a => userAchievements.some(ua => ua.achievementId === a.id)).length, 0);

          return (
            <div key={cat.name} className="bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden">
              <button 
                onClick={() => setExpandedCategories(prev => prev.includes(cat.name) ? prev.filter(c => c !== cat.name) : [...prev, cat.name])}
                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-orange-500">
                    <Layers size={18} />
                  </div>
                  <div>
                    <span className="font-black text-xs text-white uppercase tracking-tight">{cat.name}</span>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">{unlockedInCat} / {totalInCat}</p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isCatExpanded ? 180 : 0 }}>
                  <ChevronDown size={18} className="text-gray-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isCatExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-4 space-y-4">
                      {cat.subs.map((sub, idx) => {
                        const subKey = sub.name || `no-sub-${cat.name}-${idx}`;
                        const isSetExpanded = !sub.name || expandedSets.includes(subKey);
                        const unlockedInSub = sub.achievements.filter(a => userAchievements.some(ua => ua.achievementId === a.id)).length;
                        const totalInSub = sub.achievements.length;

                        return (
                          <div key={subKey} className="space-y-3">
                            {sub.name && (
                              <button 
                                onClick={() => setExpandedSets(prev => prev.includes(subKey) ? prev.filter(s => s !== subKey) : [...prev, subKey])}
                                className="w-full flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-2 text-left">
                                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSetExpanded ? 'bg-orange-500' : 'bg-gray-700'}`} />
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{sub.name}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-orange-500/60">{unlockedInSub}/{totalInSub}</span>
                                  <motion.div animate={{ rotate: isSetExpanded ? 180 : 0 }}>
                                    <ChevronDown size={14} className="text-gray-700" />
                                  </motion.div>
                                </div>
                              </button>
                            )}
                            
                            <AnimatePresence>
                              {isSetExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-3 gap-3 py-2">
                                    {sub.achievements.map(def => (
                                      <AchievementBadge 
                                        key={def.id} 
                                        achievement={def} 
                                        userAchievement={userAchievements.find(a => a.achievementId === def.id)} 
                                        lang={lang}
                                        onClick={() => setSelectedAchievement(def)}
                                      />
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedAchievement && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-[#1E1E1E] rounded-2xl p-8 z-[120] border border-white/10 shadow-2xl space-y-6 text-center"
            >
              {(() => {
                const isImageIcon = selectedAchievement.icon.startsWith('/') || selectedAchievement.icon.includes('.');
                return (
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.4)] border-2 border-orange-400 db-glow-orange overflow-hidden ${isImageIcon ? 'p-0 bg-white/5' : 'p-4 bg-orange-500'}`}>
                    <IconRenderer name={selectedAchievement.icon} size={40} className="text-white" />
                  </div>
                );
              })()}
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight leading-tight">
                  {selectedAchievement.title[lang]}
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  {selectedAchievement.description[lang]}
                </p>
              </div>

              {(() => {
                const { earned, progress, tier } = selectedAchievement.check(cards, inventory);
                const userAch = userAchievements.find(a => a.achievementId === selectedAchievement.id);
                const isMaxTier = selectedAchievement.type === 'tiered' && tier !== undefined && tier >= (selectedAchievement.tiers?.length || 1) - 1;
                
                return (
                  <div className="space-y-4">
                    {userAch && (
                      <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/30 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{t.unlockedAt}</p>
                          {selectedAchievement.type === 'tiered' && (
                            <span className="text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full">
                              LVL {(userAch.currentTier || 0) + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white uppercase italic">
                          {new Date(userAch.unlockedAt.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {(!userAch || (selectedAchievement.type === 'tiered' && !isMaxTier)) && (
                      <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span>{selectedAchievement.type === 'tiered' ? 'Progreso hacia siguiente nivel' : 'Progreso'}</span>
                          <span className="text-orange-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                          />
                        </div>
                        {!earned && (
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Sigue coleccionando para desbloquear</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <button 
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-colors uppercase text-xs tracking-widest"
              >
                {lang === 'es' ? 'CERRAR' : 'CLOSE'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function GameSelectionModal({ lang, onSelect }: { lang: 'es' | 'en', onSelect: (type: 'masters' | 'fusion') => void }) {
  const t = {
    title: { es: 'SELECCIONA TU JUEGO', en: 'SELECT YOUR GAME' },
    subtitle: { es: '¿Qué colección quieres gestionar hoy?', en: 'Which collection do you want to manage today?' },
    masters: 'MASTERS',
    fusion: 'FUSION WORLD'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-2 bg-orange-500 rounded-full mb-4" />
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{t.title[lang]}</h2>
          <p className="text-gray-400 text-sm">{t.subtitle[lang]}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('masters')}
            className="group relative bg-white p-10 rounded-2xl border border-gray-200 hover:border-orange-500 transition-all flex flex-col items-center justify-center h-48 shadow-lg"
          >
             <div className="w-full flex items-center justify-center overflow-hidden">
                <img referrerPolicy="no-referrer" src="/logo_masters.webp" alt="Masters" className="max-h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
             </div>
             <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('fusion')}
            className="group relative bg-white p-10 rounded-2xl border border-gray-200 hover:border-cyan-500 transition-all flex flex-col items-center justify-center h-48 shadow-lg"
          >
             <div className="w-full flex items-center justify-center overflow-hidden">
                <img referrerPolicy="no-referrer" src="/logo_fw_b.png" alt="Fusion World" className="max-h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-110" />
             </div>
             <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const { user, loading: authLoading, profile, error, isQuotaExceeded, quotaErrorMessage, setIsQuotaExceeded } = useAuth();
  const isAdmin = user?.email === 'anulix1983@gmail.com';
  const [dataProtected, setDataProtected] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [emailAuth, setEmailAuth] = useState({ email: '', password: '', isLogin: true, error: '' });
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    const saved = localStorage.getItem('lang');
    return (saved as 'es' | 'en') || 'es';
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    return !localStorage.getItem('lang');
  });

  const [gameType, setGameType] = useState<'masters' | 'fusion'>(() => {
    const saved = localStorage.getItem('gameType');
    return (saved as 'masters' | 'fusion') || 'masters';
  });

  const [showGameSelector, setShowGameSelector] = useState(() => {
    const lastSelection = localStorage.getItem('lastGameSelectionDate');
    const today = new Date().toDateString();
    return lastSelection !== today;
  });
  const [showQuotaDetails, setShowQuotaDetails] = useState(false);

  const handleGameSelect = (type: 'masters' | 'fusion') => {
    setGameType(type);
    localStorage.setItem('gameType', type);
    localStorage.setItem('lastGameSelectionDate', new Date().toDateString());
    setShowGameSelector(false);
  };

  const currentCategories = useMemo(() => {
    if (gameType === 'fusion') return FUSION_CATEGORIES;
    return MAIN_CATEGORIES;
  }, [gameType]);

  const currentGroups = useMemo(() => {
    if (gameType === 'fusion') return FUSION_EXPANSION_GROUPS;
    return expansionGroups;
  }, [gameType]);

  const updateProfileFields = async (fields: any) => {
    if (!user || isQuotaExceeded) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), fields);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLanguageSelect = (selectedLang: 'es' | 'en') => {
    setLang(selectedLang);
    localStorage.setItem('lang', selectedLang);
    setShowLanguageSelector(false);
    if (user) {
      updateProfileFields({ language: selectedLang });
    }
  };

  useEffect(() => {
    if (profile) {
      if (profile.language && profile.language !== lang) {
        setLang(profile.language as 'es' | 'en');
        localStorage.setItem('lang', profile.language);
        setShowLanguageSelector(false);
      }
      if (profile.collectionGoal && profile.collectionGoal !== collectionGoal) {
        setCollectionGoal(profile.collectionGoal as 'collector' | 'player');
        localStorage.setItem('collectionGoal', profile.collectionGoal);
      }
      if (profile.hasSetGoal !== undefined && profile.hasSetGoal !== hasSetGoal) {
        setHasSetGoal(profile.hasSetGoal);
        localStorage.setItem('hasSetGoal', profile.hasSetGoal.toString());
      }
      if (profile.hasCompletedTutorial !== undefined && profile.hasCompletedTutorial !== hasCompletedTutorial) {
        setHasCompletedTutorial(profile.hasCompletedTutorial);
        localStorage.setItem('tutorialStep', profile.hasCompletedTutorial ? 'completed' : '');
      }
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  const [cards, setCards] = useState<Card[]>([]);


  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [bulkQuantity, setBulkQuantity] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLongPress = (cardId: string) => {
    setIsMultiSelectMode(true);
    const newSelected = new Set(selectedCardIds);
    newSelected.add(cardId);
    setSelectedCardIds(newSelected);
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
      if (newSelected.size === 0) {
        setIsMultiSelectMode(false);
      }
    } else {
      newSelected.add(cardId);
    }
    setSelectedCardIds(newSelected);
  };

  const handleBulkUpdate = async () => {
    if (selectedCardIds.size === 0 || !user || isQuotaExceeded) return;
    
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();
      const updatedCardIds = Array.from(selectedCardIds);
      
      let newInventory = [...inventory];

      // Logic check for collector mode toggle
      const isCollectorToggleOff = collectionGoal === 'collector' && updatedCardIds.every(id => {
        const item = inventory.find(i => i.cardId === id);
        return item && item.quantity >= 1;
      });
      
      for (const cardId of updatedCardIds) {
        const existingItem = inventory.find(i => i.cardId === cardId);
        
        if (isCollectorToggleOff) {
          // If all selected are already owned, unselect (delete) them all
          if (existingItem) {
            const docRef = doc(db, 'inventory', existingItem.id);
            batch.delete(docRef);
            newInventory = newInventory.filter(i => i.id !== existingItem.id);
          }
        } else {
          const qty = collectionGoal === 'player' ? bulkQuantity : 1;
          
          if (existingItem) {
            // If already exists, update document using its ID from local inventory
            const docRef = doc(db, 'inventory', existingItem.id);
            batch.update(docRef, { 
              quantity: qty,
              updatedAt: now 
            });
            
            const index = newInventory.findIndex(i => i.id === existingItem.id);
            if (index > -1) newInventory[index].quantity = qty;
          } else {
            // If not exists, create new doc
            const newDocRef = doc(collection(db, 'inventory'));
            batch.set(newDocRef, {
              cardId,
              ownerId: user.uid,
              quantity: qty,
              addedAt: now
            });
            // We don't add to local newInventory here because onSnapshot will deliver it
          }
        }
      }

      setInventory(newInventory);
      setIsMultiSelectMode(false);
      setSelectedCardIds(new Set());
      setBulkQuantity(1);

      await batch.commit();
      
      // Update denormalized stats if there was a deletion in collector mode
      // Otherwise, the addition might be handled later via onSnapshot or we can just always update stats
      const uniqueCards = newInventory.filter(i => i.quantity > 0).length;
      const totalCards = newInventory.reduce((sum, i) => sum + i.quantity, 0);
      updateDoc(doc(db, 'users', user.uid), {
        uniqueCards,
        totalCards,
        lastStatsUpdate: serverTimestamp()
      }).catch(err => console.error("Failed to update user stats post-bulk:", err));
      
      console.log(`[BulkUpdate] Successfully synced ${updatedCardIds.length} cards.`);
    } catch (error) {
      console.error("Error in bulk update:", error);
      handleFirestoreError(error, OperationType.WRITE, 'inventory_bulk');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncItemToFirestore = async (cardId: string, quantity: number) => {
    if (!user || isQuotaExceeded) return;
    // This is now predominantly a fallback or for single updates.
    // Optimal usage should favor handleUpdateQuantity or handleBulkUpdate.
    try {
      const existingItem = inventory.find(i => i.cardId === cardId);
      if (existingItem) {
        await updateDoc(doc(db, 'inventory', existingItem.id), { 
          quantity,
          updatedAt: serverTimestamp()
        });
      } else {
        // Double check with server only if really necessary, 
        // but typically inventory state from onSnapshot is enough.
        await addDoc(collection(db, 'inventory'), {
          cardId,
          ownerId: user.uid,
          quantity,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `inventory/${cardId}`);
    }
  };

  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [showChangelogOnEntry, setShowChangelogOnEntry] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);

  // Fetch total users for admin
  useEffect(() => {
    if (user?.email === 'anulix1983@gmail.com') {
      const fetchTotalUsers = async () => {
        try {
          const coll = collection(db, 'users');
          const snapshot = await getCountFromServer(coll);
          setTotalUsersCount(snapshot.data().count);
        } catch (error) {
          console.error("Error fetching total users:", error);
        }
      };
      fetchTotalUsers();
    }
  }, [user]);

  // Check changelog visibility on entry
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    const isNewVersion = lastSeenVersion !== APP_VERSION;

    if (user) {
      if (isNewVersion) {
        setShowChangelogOnEntry(true);
      } else {
        // If not showing changelog, check if we should show the community modal (once a week)
        const lastCommunityModalSeen = localStorage.getItem('lastCommunityModalSeen');
        const now = Date.now();
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastCommunityModalSeen || (now - parseInt(lastCommunityModalSeen) > ONE_WEEK)) {
          setIsCommunityModalOpen(true);
        }
      }
    }
  }, [user]);

  const markChangelogAsSeen = () => {
    const wasShownOnEntry = showChangelogOnEntry;
    localStorage.setItem('lastSeenVersion', APP_VERSION);
    setShowChangelogOnEntry(false);
    setIsChangelogModalOpen(false);
    
    // Show community message after changelog on entry if it's been more than a week
    const lastCommunityModalSeen = localStorage.getItem('lastCommunityModalSeen');
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    if (wasShownOnEntry && (!lastCommunityModalSeen || (now - parseInt(lastCommunityModalSeen) > ONE_WEEK))) {
      setIsCommunityModalOpen(true);
    }
  };
  const [isExpansionSheetOpen, setIsExpansionSheetOpen] = useState(false);

  const closeCommunityModal = () => {
    localStorage.setItem('lastCommunityModalSeen', Date.now().toString());
    setIsCommunityModalOpen(false);
  };

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAlternatives, setShowAlternatives] = useState(true);
  const [currentCollectionCategory, setCurrentCollectionCategory] = useState<string | null>(null);
  const [currentCollectionSubCategory, setCurrentCollectionSubCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [collectionGoal, setCollectionGoal] = useState<'collector' | 'player'>(() => {
    const saved = localStorage.getItem('collectionGoal');
    return (saved as 'collector' | 'player') || 'collector';
  });
  const [hasSetGoal, setHasSetGoal] = useState(() => {
    return localStorage.getItem('hasSetGoal') === 'true';
  });

  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    return localStorage.getItem('tutorialStep') === 'completed';
  });

  const tutorialSteps: Step[] = useMemo(() => [
    {
      target: '#tour-nav-home',
      content: lang === 'es' 
        ? 'En Inicio verás el resumen global de tu colección. Usa el selector superior para cambiar entre Fusion World y Masters.' 
        : 'In Home you will see the global summary of your collection. Use the top selector to switch between Fusion World and Masters.',
      skipBeacon: true,
      title: lang === 'es' ? 'Vista General' : 'Overview',
      placement: 'top',
    },
    {
      target: '#tour-nav-collection',
      content: lang === 'es' 
        ? 'Navega por el catálogo completo organizado por Sets, Expansiones y Paquetes Promocionales para descubrir y adquirir nuevas cartas.' 
        : 'Browse the full catalog organized by Sets, Expansions, and Promotional Packs to discover and acquire new cards.',
      skipBeacon: true,
      title: lang === 'es' ? 'Explorar' : 'Explore',
      placement: 'top',
    },
    {
      target: '#tour-nav-search',
      content: lang === 'es' 
        ? 'Encuentra cartas por nombre o código. Usa el botón de filtros para afinar por rareza, color o etiquetas.' 
        : 'Find cards by name or code. Use the filters button to refine by rarity, color, or tags.',
      skipBeacon: true,
      title: lang === 'es' ? 'Búsqueda Avanzada' : 'Advanced Search',
      placement: 'top',
    },
    {
      target: '#tour-nav-stats',
      content: lang === 'es' 
        ? 'Descubre qué colores o rarezas predominan en tu carpeta a través de gráficas interactivas.' 
        : 'Discover what colors or rarities dominate your binder through interactive charts.',
      skipBeacon: true,
      title: lang === 'es' ? 'Gráficos y Datos' : 'Charts and Data',
      placement: 'top',
    },
    {
      target: '#tour-nav-profile',
      content: lang === 'es' 
        ? 'Revisa tus Preferencias y Logros. Si te gusta la App, ¡tienes un botón para apoyar el proyecto en Ko-Fi!' 
        : 'Check your Preferences and Achievements. If you like the App, there is a button to support the project on Ko-Fi!',
      skipBeacon: true,
      title: lang === 'es' ? 'Tu Perfil' : 'Your Profile',
      placement: 'bottom',
    }
  ], [lang]);

  const handleJoyrideCallback = (data: any) => {
    const { status, type, index, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setHasCompletedTutorial(true);
      localStorage.setItem('tutorialStep', 'completed');
      if (user) {
        updateDoc(doc(db, 'users', user.uid), { hasCompletedTutorial: true }).catch(err => {
          console.error("Failed to update tutorial status in DB:", err);
        });
      }
    }

    if (type === 'step:after') {
      if (action === 'next') {
         if (index === 0) setActiveTab('collection');
         if (index === 1) setActiveTab('search');
         if (index === 2) setActiveTab('stats');
         if (index === 3) setActiveTab('profile');
      } else if (action === 'prev') {
         if (index === 1) setActiveTab('home');
         if (index === 2) setActiveTab('collection');
         if (index === 3) setActiveTab('search');
         if (index === 4) setActiveTab('stats');
      }
    }
  };

  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const userAchievementsRef = useRef<UserAchievement[]>([]);
  
  useEffect(() => {
    userAchievementsRef.current = userAchievements;
  }, [userAchievements]);
  const [unlockedAchievement, setUnlockedAchievement] = useState<QueuedAchievement | null>(null);
  const [unlockedQueue, setUnlockedQueue] = useState<QueuedAchievement[]>([]);
  const [newAchievementsCount, setNewAchievementsCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const processedAchievementIds = useRef<Set<string>>(new Set());
  const achievementsLoaded = useRef(false);
  const failedWrites = useRef<Set<string>>(new Set());

  // Achievement queue processor
  const handleAchievementDismiss = useCallback(() => {
    setUnlockedAchievement(null);
  }, []);

  useEffect(() => {
    if (unlockedQueue.length > 0 && !unlockedAchievement) {
      const next = unlockedQueue[0];
      console.log(`[ACHIEVEMENT] Pulling from queue: ${next.def.id} (Tier: ${next.tier ?? 'N/A'})`);
      setUnlockedAchievement(next);
      setUnlockedQueue(prev => prev.slice(1));
      
      // If it was marked as unseen in DB, we should mark it as seen now
      const userAch = userAchievements.find(a => a.achievementId === next.def.id);
      if (userAch && !userAch.isSeen) {
        updateDoc(doc(db, 'achievements', userAch.id), { isSeen: true })
          .then(() => console.log(`[ACHIEVEMENT] Marked as seen in DB: ${next.def.id}`))
          .catch((err) => handleFirestoreError(err, OperationType.UPDATE, `achievements/${userAch.id}`));
      }
    }
  }, [unlockedQueue, unlockedAchievement, userAchievements]);
  const [profileView, setProfileView] = useState<'main' | 'achievements'>('main');

  const achievementsList = useMemo(() => getAchievementsList(cards, currentGroups, gameType), [cards, currentGroups, gameType]);

  useEffect(() => {
    localStorage.setItem('collectionGoal', collectionGoal);
  }, [collectionGoal]);

  const DEFAULT_ALTERNATIVES = ['event', 'tournament', 'judge', 'giant', 'championship', 'ultimate-battle', 'serial', 'sleeve', 'playmat'];

  useEffect(() => {
    localStorage.setItem('hasSetGoal', hasSetGoal.toString());
  }, [hasSetGoal]);

  useEffect(() => {
    localStorage.setItem('gameType', gameType);
    setCurrentCollectionCategory(null);
    setCurrentCollectionSubCategory(null);
    setExpandedCategories([]);
    setSearchQuery('');
    setFilters({ rarities: [], colors: [], expansion: 'Todos', types: [], legalStatus: [], alternatives: DEFAULT_ALTERNATIVES, owned: 'all' });
  }, [gameType]);

  const recentlyAddedCards = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return inventory
      .filter(item => {
        if (!item.addedAt) return false;
        const addedDate = item.addedAt.toDate ? item.addedAt.toDate() : new Date(item.addedAt);
        return addedDate > sevenDaysAgo && item.quantity > 0;
      })
      .sort((a, b) => {
        const dateA = a.addedAt.toDate ? a.addedAt.toDate() : new Date(a.addedAt);
        const dateB = b.addedAt.toDate ? b.addedAt.toDate() : new Date(b.addedAt);
        return dateB - dateA;
      })
      .slice(0, 4)
      .map(item => cards.find(c => c.id === item.cardId))
      .filter((c): c is Card => !!c);
  }, [inventory, cards]);

  const [filters, setFilters] = useState<{
    rarities: string[];
    colors: string[];
    expansion: string;
    types: string[];
    legalStatus: string[];
    alternatives: string[];
    owned: 'all' | 'owned' | 'not-owned';
  }>({
    rarities: [],
    colors: [],
    expansion: 'Todos',
    types: [],
    legalStatus: [],
    alternatives: DEFAULT_ALTERNATIVES,
    owned: 'all'
  });
  const [sortBy, setSortBy] = useState<'index' | 'name'>('index');

  useEffect(() => {
    setIsSearchOpen(false);
    if (activeTab === 'search') {
      setSearchQuery('');
    }
  }, [activeTab]);

  useEffect(() => {
    // Solo subimos al principio si estamos entrando en una expansión específica (vista de cartas)
    if (filters.expansion !== 'Todos') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filters.expansion]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchQuery('');
  };

  const filteredCards = cards.filter(card => {
    const isSecretFilter = searchQuery.toLowerCase() === 'faltantes';
    const isDeluxeFilter = searchQuery.toLowerCase() === 'deluxe pack 2024 vol.1';
    const isUnionForceFilter = searchQuery.toLowerCase() === 'union force release tournament';
    const isCrossWorldsFilter = searchQuery.toLowerCase() === 'cross worlds release tournament';
    const isColossalWarfareFilter = searchQuery.toLowerCase() === 'colossal warfare release tournament';
    const isPuzzleHuntFilter = searchQuery.toLowerCase() === 'anime expo 2017' || searchQuery.toLowerCase() === 'puzzle hunt';
    
    // Hide P-005_PR by default (unless puzzle hunt searched or owned)
    if (card.id === 'P-005_PR') {
      const isOwned = inventory.some(i => i.cardId === 'P-005_PR' && i.quantity > 0);
      if (!isPuzzleHuntFilter && !isOwned) return false;
    }

    if (isDeluxeFilter) {
      return card.id === 'P-593_PR' || card.id === 'P-597_PR';
    }

    if (isUnionForceFilter) {
      return ['BT1-010_PR', 'BT1-045_PR', 'BT1-069_PR', 'BT1-100_PR'].includes(card.id);
    }

    if (isCrossWorldsFilter) {
      return ['BT2-022_PR', 'BT2-052_PR', 'BT2-083_PR'].includes(card.id);
    }

    if (isColossalWarfareFilter) {
      return ['BT3-005_PR', 'BT3-039_PR', 'BT3-075_PR', 'BT3-105_PR', 'BT3-117_PR'].includes(card.id);
    }

    if (isPuzzleHuntFilter) {
      return card.id === 'P-005_PR';
    }
    
    // Check if card matches search
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedQuery = normalize(searchQuery);
    
    const specialCardInfo = CARD_METADATA[card.id];
    const sourceProduct = specialCardInfo?.sourceProduct || '';
    const setMeta = SET_METADATA[card.expansion];
    const setName = setMeta?.sourceProduct || '';

    const matchesSearch = (() => {
      const q = searchQuery.toLowerCase();
      const nq = normalize(searchQuery);
      
      if (isSecretFilter) return true;
      if (q.length < 2) return true;

      // Basic fields
      if (card.name && card.name.toLowerCase().includes(q)) return true;
      if (card.cardNumber && card.cardNumber.toLowerCase().includes(q)) return true;
      if (card.id && card.id.toLowerCase().includes(q)) return true;
      
      // Normalized matching
      if (card.name && normalize(card.name).includes(nq)) return true;
      if (card.cardNumber && normalize(card.cardNumber).includes(nq)) return true;
      
      // Search by source product / pack name
      if (sourceProduct && sourceProduct.toLowerCase().includes(q)) return true;
      if (setName && setName.toLowerCase().includes(q)) return true;
      if (sourceProduct && normalize(sourceProduct).includes(nq)) return true;
      if (setName && normalize(setName).includes(nq)) return true;
      
      // Search by expansion label from currentGroups
      const findInGroups = (items: any[]): boolean => {
        if (!items) return false;
        for (const item of items) {
          if (item.id === card.expansion) {
            const label = typeof item.label === 'string' ? item.label : (item?.label?.[lang] || '');
            if (label && label.toLowerCase().includes(q)) return true;
          }
          if (item.subItems) {
            if (findInGroups(item.subItems)) return true;
          }
        }
        return false;
      };
      
      if (currentGroups) {
        for (const group of currentGroups) {
          if (group.items && findInGroups(group.items)) return true;
        }
      }
      
      return false;
    })();
    
    // If secret filter is active, only show cards not in inventory
    if (isSecretFilter && matchesSearch) {
      const isOwned = inventory.some(i => i.cardId === card.id && i.quantity > 0);
      if (isOwned) return false;
    }

    const cardTags = getCardTags(card);
    const isEvent = cardTags.includes('event');
    const isTournament = cardTags.includes('tournament');
    const isJudge = cardTags.includes('judge');
    const isGiant = cardTags.includes('giant');
    const isSerial = cardTags.includes('serial');
    
    // Check expansion match
    let matchesExpansion = filters.expansion === 'Todos';
    if (!matchesExpansion) {
      if (filters.expansion === 'COL02') matchesExpansion = isGiant;
      else if (filters.expansion === 'COL05') matchesExpansion = isEvent;
      else if (filters.expansion === 'COL06') matchesExpansion = isTournament;
      else if (filters.expansion === 'COL07') matchesExpansion = isJudge;
      else if (PACK_ARRAYS[filters.expansion]) {
        matchesExpansion = PACK_ARRAYS[filters.expansion].includes(card.id);
      }
      else if (filters.expansion === 'FP' && gameType === 'fusion') {
        matchesExpansion = card.expansion === 'FP' || card.cardNumber.startsWith('FP-');
      }
      else {
        matchesExpansion = card.expansion === filters.expansion && !isGiant;
        if (!matchesExpansion && filters.expansion) {
          if (filters.expansion.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${filters.expansion}`]?.includes(card.id)) matchesExpansion = true;
          if (filters.expansion === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(card.id)) matchesExpansion = true;
          
          if (gameType === 'fusion' && (filters.expansion.startsWith('FB') || filters.expansion.startsWith('FS') || filters.expansion.startsWith('SB'))) {
            const baseNumber = card.cardNumber.split('_')[0];
            if (baseNumber.startsWith(filters.expansion + '-')) {
              matchesExpansion = true;
            }
          }
        }
      }
    }

    // Handle alternatives toggle for BASE sets
    const isAlt = isAlternative(card.id) && card.rarity !== 'SPR' && card.rarity !== 'GDR';
    const isVirtual = isVirtualSet(filters.expansion);
    
    if (!isVirtual && filters.expansion !== 'Todos' && isAlt && !showAlternatives) return false;

    // Filters from the modal
    const matchesRarity = filters.rarities.length === 0 || filters.rarities.includes(card.rarity);
    const matchesColor = filters.colors.length === 0 || filters.colors.includes(card.color);
    const effectiveType = card.id.includes('_SLR') ? 'Leader Rare' : card.type;
    const matchesType = filters.types.length === 0 || filters.types.includes(effectiveType);
    const matchesLegal = filters.legalStatus.length === 0 || (card.legalStatus && filters.legalStatus.includes(card.legalStatus.toLowerCase()));
    
    // Owned filter logic
    if (filters.owned !== 'all') {
      const isOwned = inventory.some(i => i.cardId === card.id && i.quantity > 0);
      if (filters.owned === 'owned' && !isOwned) return false;
      if (filters.owned === 'not-owned' && isOwned) return false;
    }

    // Alternatives individual filters
    if (isEvent && !filters.alternatives.includes('event')) return false;
    if (isTournament && !filters.alternatives.includes('tournament')) return false;
    
    if (gameType === 'masters') {
      if (isJudge && !filters.alternatives.includes('judge')) return false;
      if (isGiant && !filters.alternatives.includes('giant')) return false;
    } else {
      const isChampionship = cardTags.includes('championship');
      const isUltimateBattle = cardTags.includes('ultimate-battle');
      const isSerialTag = cardTags.includes('serial');
      if (isChampionship && !filters.alternatives.includes('championship')) return false;
      if (isUltimateBattle && !filters.alternatives.includes('ultimate-battle')) return false;
      if (isSerialTag && !filters.alternatives.includes('serial')) return false;
    }
    
    if (filters.expansion === 'Todos' && card.id.match(/_FB\d+$/)) return false;
    
    return matchesSearch && matchesExpansion && matchesRarity && matchesColor && matchesType && matchesLegal;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    
    if (gameType === 'fusion' && filters.expansion !== 'Todos') {
      const aBase = a.cardNumber.split('_')[0];
      const bBase = b.cardNumber.split('_')[0];
      
      if (aBase === bBase) {
        const aIsBase = !a.cardNumber.includes('_');
        const bIsBase = !b.cardNumber.includes('_');
        if (aIsBase && !bIsBase) return -1;
        if (!aIsBase && bIsBase) return 1;
        return a.index - b.index;
      }
      
      // If we are looking at a specific base set, e.g. FB01, prioritize cards whose base starts with FB01-
      const viewPrefix = filters.expansion + '-';
      const aBelongsToView = aBase.startsWith(viewPrefix);
      const bBelongsToView = bBase.startsWith(viewPrefix);
      
      if (aBelongsToView && !bBelongsToView) return -1;
      if (!aBelongsToView && bBelongsToView) return 1;
      
      // If both belong to the view (or both don't), sort them by their base number so they are perfectly grouped
      if (aBelongsToView && bBelongsToView) {
        return aBase.localeCompare(bBase);
      }
      
      // Fallback for extra/promo cards added at the end
      const aStartsSet = a.id.startsWith(a.expansion);
      const bStartsSet = b.id.startsWith(b.expansion);
      if (aStartsSet && !bStartsSet) return -1;
      if (!aStartsSet && bStartsSet) return 1;
    }
    
    return a.index - b.index;
  });

  const hasActiveFilters = useMemo(() => {
    return filters.rarities.length > 0 || filters.colors.length > 0 || filters.expansion !== 'Todos' || filters.types.length > 0 || filters.legalStatus.length > 0 || filters.owned !== 'all';
  }, [filters]);

  const globalSearchResults = useMemo(() => {
    if (searchQuery.length < 2 && !hasActiveFilters) {
      // If we are in "Todos" expansion, return some default cards or empty
      if (filters.expansion === 'Todos') return [];
      return filteredCards;
    }
    return filteredCards;
  }, [filteredCards, searchQuery, hasActiveFilters, filters.expansion]);

  const availableOptions = useMemo(() => {
    // Filter cards by expansion and search query first to determine valid sub-filters
    const expansionCards = cards.filter(card => {
      // 1. Check expansion
      if (filters.expansion !== 'Todos') {
        const isGiant = getCardTags(card).includes('giant');
        if (filters.expansion === 'COL02' && !isGiant) return false;
        else if (filters.expansion === 'COL05' && !getCardTags(card).includes('event')) return false;
        else if (filters.expansion === 'COL06' && !getCardTags(card).includes('tournament')) return false;
        else if (filters.expansion === 'COL07' && !getCardTags(card).includes('judge')) return false;
        else if (PACK_ARRAYS[filters.expansion]) {
          if (!PACK_ARRAYS[filters.expansion].includes(card.id)) return false;
        }
        else if (filters.expansion === 'FP' && gameType === 'fusion') {
          if (card.expansion !== 'FP' && !card.cardNumber.startsWith('FP-')) return false;
        }
        else {
          let matchesExp = card.expansion === filters.expansion && !isGiant;
          if (!matchesExp) {
            if (filters.expansion.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${filters.expansion}`]?.includes(card.id)) matchesExp = true;
            if (filters.expansion === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(card.id)) matchesExp = true;
            if (gameType === 'fusion' && (filters.expansion.startsWith('FB') || filters.expansion.startsWith('FS') || filters.expansion.startsWith('SB'))) {
              if (card.cardNumber.split('_')[0].startsWith(filters.expansion + '-')) matchesExp = true;
            }
          }
          if (!matchesExp) return false;
        }
      }

      // 2. Check search query (simplified version of the one used in filteredCards)
      if (searchQuery.length >= 2 && searchQuery !== 'Promo Vol.4' && searchQuery !== 'Tournament Pack 2' && searchQuery !== 'Tournament Pack 3' && searchQuery !== 'Tournament Pack 4' && searchQuery !== 'Tournament Pack 5' && searchQuery !== 'Tournament Pack 6' && searchQuery !== 'Store Tournament Vol.1' && searchQuery !== 'Store Tournament Vol.2' && searchQuery !== 'Store Tournament Vol.3' && searchQuery !== 'Store Tournament Vol.4' && searchQuery !== 'Energy Marker Pack 01' && !searchQuery.startsWith('Union Force PR') && !searchQuery.startsWith('Cross Worlds PR') && !searchQuery.startsWith('Colossal Warfare PR') && searchQuery !== 'Puzzle Hunt') {
        const q = searchQuery.toLowerCase();
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const nq = normalize(searchQuery);
        
        let matchesSearch = false;
        if (card.name && card.name.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.cardNumber && card.cardNumber.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.name && normalize(card.name).includes(nq)) matchesSearch = true;
        else if (card.cardNumber && normalize(card.cardNumber).includes(nq)) matchesSearch = true;
        else {
          const specialCardInfo = CARD_METADATA[card.id];
          const sourceProduct = specialCardInfo?.sourceProduct || '';
          const setMeta = SET_METADATA[card.expansion];
          const setName = setMeta?.sourceProduct || '';
          if (sourceProduct && sourceProduct.toLowerCase().includes(q)) matchesSearch = true;
          else if (setName && setName.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.traits && card.traits.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.skill && card.skill.toLowerCase().includes(q)) matchesSearch = true;
        }
        if (!matchesSearch) return false;
      }
      return true;
    });

    const getEffectiveType = (card: Card) => {
      if (card.id.includes('_SLR')) return 'Leader Rare';
      return card.type;
    };

    let colors = Array.from(new Set(expansionCards.map(c => c.color).filter(Boolean))).sort();
    
    if (gameType === 'fusion') {
      colors = colors.filter(c => c !== 'Multi' && c !== 'None' && c !== 'Neutral');
    } else {
      colors = colors.filter(c => c !== 'None' && c !== 'Neutral');
    }
    
    // Custom sort for Fusion World rarities
    const FUSION_RARITY_ORDER = [
      'L', 'L*', 'C', 'C*', 'UC', 'UC*', 'R', 'R*', 'SR', 'SR*', 'SCR', 'SCR*', 'SCR**', 
      'ST', 'PR', 'PR*', 'E', 'E*'
    ];
    
    const rarities = ['Todos', ...Array.from(new Set(expansionCards.map(c => c.rarity)))]
      .filter(r => r && r !== 'EP12')
      .sort((a, b) => {
        if (a === 'Todos') return -1;
        if (b === 'Todos') return 1;
        if (gameType === 'fusion') {
          const indexA = FUSION_RARITY_ORDER.indexOf(a);
          const indexB = FUSION_RARITY_ORDER.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
        }
        return a.localeCompare(b);
      });

    const types = Array.from(new Set(expansionCards.map(getEffectiveType).filter(Boolean)))
      .sort((a, b) => {
        if (gameType === 'fusion') {
          const typeOrder = ['Leader', 'Battle', 'Extra', 'Energy Marker'];
          const indexA = typeOrder.indexOf(a);
          const indexB = typeOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
        }
        return a.localeCompare(b);
      });

    return { colors, rarities, types };
  }, [cards, filters.expansion, searchQuery, gameType]);

  const globalStats = useMemo(() => {
    // Para el conteo deduplicado (slots de juego)
    const baseCardsMap = new Map<string, { needed: number; owned: number }>();
    // Para el conteo raw (total de cartas físicas únicas)
    let rawNeeded = 0;
    let rawOwned = 0;
    
    cards.forEach(c => {
      const baseId = c.cardNumber.split('_')[0];
      const isAlt = isAlternative(c.id) && c.rarity !== 'SPR' && c.rarity !== 'GDR';
      
      const target = getTargetQuantity(c, collectionGoal);
      const invItem = inventory.find(i => i.cardId === c.id);
      const quantity = invItem ? invItem.quantity : 0;
      const ownedValue = Math.min(quantity, target);

      // Raw stats (para el header)
      rawNeeded += target;
      rawOwned += ownedValue;

      if (!baseCardsMap.has(baseId)) {
        baseCardsMap.set(baseId, { needed: isAlt ? 0 : target, owned: ownedValue });
      } else {
        const existing = baseCardsMap.get(baseId)!;
        if (!isAlt && existing.needed === 0) existing.needed = target;
        existing.owned = Math.max(existing.owned, ownedValue);
      }
    });

    let dedupNeeded = 0;
    let dedupOwned = 0;
    baseCardsMap.forEach(v => {
      dedupNeeded += v.needed;
      dedupOwned += v.owned;
    });

    return {
      needed: dedupNeeded,
      owned: dedupOwned,
      percentage: rawNeeded > 0 ? Math.round((rawOwned / rawNeeded) * 100) : 0,
      rawNeeded,
      rawOwned
    };
  }, [cards, inventory, collectionGoal]);

  // Reset filters if they become invalid when changing expansion
  useEffect(() => {
    if (filters.colors.length > 0) {
      const validSelectedColors = filters.colors.filter(c => availableOptions.colors.includes(c));
      if (validSelectedColors.length !== filters.colors.length) {
        setFilters(prev => ({ ...prev, colors: validSelectedColors }));
      }
    }
    if (filters.rarities.length > 0) {
      const validSelectedRarities = filters.rarities.filter(r => availableOptions.rarities.includes(r));
      if (validSelectedRarities.length !== filters.rarities.length) {
        setFilters(prev => ({ ...prev, rarities: validSelectedRarities }));
      }
    }
    if (filters.types.length > 0) {
      const validSelectedTypes = filters.types.filter(t => availableOptions.types.includes(t));
      if (validSelectedTypes.length !== filters.types.length) {
        setFilters(prev => ({ ...prev, types: validSelectedTypes }));
      }
    }
  }, [availableOptions, filters.colors.length, filters.rarities.length, filters.types.length]);

  // Main card data loading logic
  useEffect(() => {
    const loadCards = async () => {
      console.log(`[DATA] Loading cards for gameType: ${gameType}`);
      const mastersDataRaw = `${bt1Data}\n${promoData}\n${startersData}\n${expertsData}\n${expansionsData}\n${tb3Data}\n${tb2Data}\n${tb1Data}\n${eb1Data}\n${db3Data}\n${db2Data}\n${db1Data}\n${bt2Data}\n${bt3Data}\n${bt4Data}\n${bt5Data}\n${bt6Data}\n${bt7Data}\n${bt8Data}\n${bt9Data}\n${bt10Data}\n${bt11Data}\n${bt12Data}\n${bt13Data}\n${bt14Data}\n${bt15Data}\n${bt16Data}\n${bt17Data}\n${bt18Data}\n${bt19Data}\n${bt20Data}\n${bt21Data}\n${bt22Data}\n${bt23Data}\n${bt24Data}\n${bt25Data}\n${bt26Data}\n${bt27Data}\n${bt28Data}\n${bt29Data}\n${bt30Data}\n${energyMarkersData}\n${tokensData}\n${meritsData}`;
      const combinedData = gameType === 'fusion' ? fusionWorldData : mastersDataRaw;

      const parsedCards: Card[] = combinedData.split('\n').filter(line => line.trim()).map((line, i) => {
        const parts = line.split('\t').map(s => s?.trim() || '');
        const [cardNumber, name, rarity, type, color, expansion] = parts;
        
        let expansionId = expansion || '';
        if (gameType === 'masters') {
          if (expansion === 'Promos' || expansion === 'PROMO') expansionId = 'FP';
          if (expansion === 'EX1') expansionId = 'EXP1';
        }

        let imageCode = cardNumber || '';
        let imageUrl = '';
        let backImageUrl = '';
        
        if (gameType === 'fusion') {
          const originalImageCode = imageCode;

          if (IMAGE_OVERRIDES[originalImageCode]) {
            imageUrl = IMAGE_OVERRIDES[originalImageCode];
            if (type === 'Leader') {
              backImageUrl = IMAGE_OVERRIDES[originalImageCode + '_b'] || '';
            }
          } else {
            // Clean image code for standard Fusion World path
            let cleanCode = imageCode.replace(/_FB\d+$/, '').replace(/_SB\d+$/, '');
            
            // Set up FW specific override map mapping
            const set_reprint_map: Record<string, string> = {
            'FB01-085_A_SB01': 'FB01-085_p1', 'FB01-088_A_SB01': 'FB01-088_p2', 'FB01-101_A_SB01': 'FB01-101_p1',
            'FB01-103_A_SB01': 'FB01-103_p1', 'FB02-071_A_SB01': 'FB02-071_p1', 'FB02-074_A_SB01': 'FB02-074_p1',
            'FB02-085_A_SB01': 'FB02-085_p3', 'FB03-032_A_SB01': 'FB03-032_p3', 'FB03-049_A_SB01': 'FB03-049_p3',
            'FB03-062_A_SB01': 'FB03-062_p1', 'FB03-075_A_SB01': 'FB03-075_p3', 'FB03-084_A_SB01': 'FB03-084_p3',
            'FB03-099_A_SB01': 'FB03-099_p1', 'FB04-041_A_SB01': 'FB04-041_p1', 'FB04-051_A_SB01': 'FB04-051_p2',
            'FB04-051_B_SB01': 'FB04-051_p3', 'FB04-060_A_SB01': 'FB04-060_p5', 'FB04-069_A_SB01': 'FB04-069_p3',
            'FB04-072_A_SB01': 'FB04-072_p3', 'FB04-073_A_SB01': 'FB04-073_p1', 'FB04-076_A_SB01': 'FB04-076_p3',
            'FB04-088_A_SB01': 'FB04-088_p1', 'FB04-091_A_SB01': 'FB04-091_p4', 'FB04-095_A_SB01': 'FB04-095_p3',
            'FB04-096_A_SB01': 'FB04-096_p1', 'FB05-119_A_SB01': 'FB05-119_p3', 'FB05-119_B_SB01': 'FB05-119_p4',
            'FB06-011_A_SB01': 'FB06-011_p1', 'FB06-012_A_SB01': 'FB06-012_p1', 'FB06-014_A_SB01': 'FB06-014_p1',
            'FB06-019_A_SB01': 'FB06-019_p1', 'FB06-022_A_SB01': 'FB06-022_p1', 'FB06-024_A_SB01': 'FB06-024_p1',
            'FB06-025_A_SB01': 'FB06-025_p2', 'FB06-025_B_SB01': 'FB06-025_p3', 'FB06-026_A_SB01': 'FB06-026_p1',
            'FB06-027_A_SB01': 'FB06-027_p1', 'FB06-033_A_SB01': 'FB06-033_p1', 'FB06-035_A_SB01': 'FB06-035_p1',
            'FB06-035_B_SB01': 'FB06-035_p2', 'FB06-037_A_SB01': 'FB06-037_p1', 'FB06-038_A_SB01': 'FB06-038_p1',
            'FB06-039_A_SB01': 'FB06-039_p1', 'FB06-041_A_SB01': 'FB06-041_p1', 'FB06-043_A_SB01': 'FB06-043_p1',
            'FB06-044_A_SB01': 'FB06-044_p1', 'FB06-045_A_SB01': 'FB06-045_p1', 'FB06-046_A_SB01': 'FB06-046_p1',
            'FB06-100_A_SB01': 'FB06-100_p1', 'FB06-102_A_SB01': 'FB06-102_p1', 'FB06-105_A_SB01': 'FB06-105_p1',
            'FB06-113_A_SB01': 'FB06-113_p1', 'FB06-113_B_SB01': 'FB06-113_p2', 'FB06-117_A_SB01': 'FB06-117_p1',
            'FS05-05_A_SB01': 'FS05-05_p2',
            // SB02 Mappings
            'FB01-107_A_SB02': 'FB01-107_p2', 'FB01-108_A_SB02': 'FB01-108_p3', 'FB01-108_B_SB02': 'FB01-108_p4',
            'FB01-116_A_SB02': 'FB01-116_p2', 'FB01-130_A_SB02': 'FB01-130_p1', 'FB01-132_A_SB02': 'FB01-132_p1',
            'FB01-138_A_SB02': 'FB01-138_p2', 'FB01-140_A_SB02': 'FB01-140_p2', 'FB03-047_A_SB02': 'FB03-047_p3',
            'FB03-071_A_SB02': 'FB03-071_p4', 'FB03-081_A_SB02': 'FB03-081_p4', 'FB04-042_A_SB02': 'FB04-042_p6',
            'FB04-057_A_SB02': 'FB04-057_p3', 'FB04-097_A_SB02': 'FB04-097_p2', 'FB05-031_A_SB02': 'FB05-031_p3',
            'FB05-039_A_SB02': 'FB05-039_p4', 'FB05-046_A_SB02': 'FB05-046_p1', 'FB05-048_A_SB02': 'FB05-048_p2',
            'FB05-053_A_SB02': 'FB05-053_p4', 'FB05-064_A_SB02': 'FB05-064_p1', 'FB05-071_A_SB02': 'FB05-071_p2',
            'FB05-073_A_SB02': 'FB05-073_p1', 'FB05-074_A_SB02': 'FB05-074_p3', 'FB05-077_A_SB02': 'FB05-077_p1',
            'FB05-081_A_SB02': 'FB05-081_p2', 'FB05-085_A_SB02': 'FB05-085_p1', 'FB06-010_A_SB02': 'FB06-010_p1',
            'FB06-013_A_SB02': 'FB06-013_p4', 'FB06-016_A_SB02': 'FB06-016_p2', 'FB06-023_A_SB02': 'FB06-023_p2',
            'FB06-096_A_SB02': 'FB06-096_p2', 'FB06-108_A_SB02': 'FB06-108_p4', 'FB06-108_B_SB02': 'FB06-108_p5',
            'FB06-110_A_SB02': 'FB06-110_p2', 'FB06-111_A_SB02': 'FB06-111_p2', 'FB06-115_A_SB02': 'FB06-115_p2',
            'FB06-116_A_SB02': 'FB06-116_p2', 'FB06-118_A_SB02': 'FB06-118_p1', 'FB06-119_A_SB02': 'FB06-119_p2',
            'FB07-004_A_SB02': 'FB07-004_p2', 'FB07-007_A_SB02': 'FB07-007_p1', 'FB07-097_A_SB02': 'FB07-097_p2',
            'FB07-097_B_SB02': 'FB07-097_p3', 'FB07-099_A_SB02': 'FB07-099_p2', 'FB07-100_A_SB02': 'FB07-100_p1',
            'FB07-103_A_SB02': 'FB07-103_p1', 'FB07-115_A_SB02': 'FB07-115_p2', 'FB07-116_A_SB02': 'FB07-116_p2',
            'FB07-117_A_SB02': 'FB07-117_p2', 'FB07-118_A_SB02': 'FB07-118_p2', 'FB07-120_A_SB02': 'FB07-120_p2',
            'FS04-01_A_SB02': 'FS04-01_p2', 'FS04-01_B_SB02': 'FS04-01_p3', 'FS04-11_A_SB02': 'FS04-11_p5',
            'FS04-12_A_SB02': 'FS04-12_p3',
            // Promo Mappings
            'FP-022': 'FP-022_p1', 'FP-023': 'FP-023_p1',
            // Alt Arts from Booster Reprints
            'FB01-066_A_FB02': 'FB01-066_p2', 'FS01-15_A_FB02': 'FS01-15_p2', 'FS03-15_A_FB02': 'FS03-15_p2',
            'FS04-16_A_FB02': 'FS04-16_p2', 'FB01-016_A_FB03': 'FB01-016_p1', 'FB01-049_A_FB03': 'FB01-049_p3',
            'FS04-09_A_FB03': 'FS04-09_p2', 'FB01-049_A_FB05': 'FB01-049_p2'
          };

          if (set_reprint_map[originalImageCode]) {
            const mapped = set_reprint_map[originalImageCode];
            if (type === 'Leader') {
              const base = mapped.split('_')[0];
              const p_suffix = mapped.split('_')[1];
              imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_f_${p_suffix}.webp`;
              backImageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_b_${p_suffix}.webp`;
            } else {
              imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${mapped}.webp?v1`;
            }
          } else {
            // General Parallel Art Replacement
            let finalCode = cleanCode.replace(/_AA$/, '_p2').replace(/_A$/, '_p1');
            let postfix = imageCode.startsWith('E-') || imageCode.startsWith('E01-') || imageCode.startsWith('E02-') || imageCode.startsWith('E03-') || expansion === 'FP' || imageCode.includes('_') ? '?v1' : '';

            if (type === 'Leader') {
              const base = cleanCode.replace(/_AA$/, '').replace(/_A$/, '');
              const p = cleanCode.includes('_AA') ? 'p2' : cleanCode.includes('_A') ? 'p1' : '';
              if (p) {
                imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_f_${p}.webp`;
                backImageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_b_${p}.webp`;
              } else {
                imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_f.webp`;
                backImageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${base}_b.webp`;
              }
            } else {
              imageUrl = `https://www.dbs-cardgame.com/fw/images/cards/card/en/${finalCode}.webp${postfix}`;
            }
          }
          }
        } else {
          // Masters Image Logic
          if (IMAGE_OVERRIDES[imageCode]) {
            imageUrl = IMAGE_OVERRIDES[imageCode];
            if (type === 'Leader') {
              backImageUrl = IMAGE_OVERRIDES[imageCode + '_b'] || '';
            }
          } else {
            let finalCode = imageCode;

            // Map standard promo suffixes back to PR, as most event/judge pack generic promos are registered as _PR on the official site
            if (finalCode.includes('_SLR')) {
              finalCode = finalCode.replace('_SLR', '_PR');
            }
            if (/_EP\d+$/.test(finalCode) || /_JP\d+$/.test(finalCode) || /_PR\d+$/.test(finalCode)) {
               finalCode = finalCode.replace(/_[A-Z]+\d+$/, '_PR');
            }
            
            // Fix Expansion Set EX 1-9 leading zeros (e.g. EX2-01 -> EX02-01)
            finalCode = finalCode.replace(/^EX([1-9])(-)/, 'EX0$1$2');

            // Clean specific suffixes that shouldn't affect image lookup
            finalCode = finalCode.replace(/_TS$/, '_PR').replace(/_GS$/, '');

            imageUrl = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${finalCode}.png`;
            if (type === 'Leader') {
              backImageUrl = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${finalCode}_b.png`;
            }
          }
        }

        // Fallback for Energy Markers without image
        const isEnergyMarker = imageCode.startsWith('M-') || imageCode.startsWith('E-') || imageCode.startsWith('E01-') || imageCode.startsWith('E02-') || imageCode.startsWith('E03-') || /^[EM]\d+/.test(imageCode);
        if (isEnergyMarker && !IMAGE_OVERRIDES[imageCode]) {
          // If it's a Fusion World marker, we generally have a URL pattern, but if it's Masters
          // or a non-standard Fusion one, we use the fallback.
          if (gameType !== 'fusion' || (!imageCode.startsWith('E-') && !imageCode.startsWith('E01-') && !imageCode.startsWith('E02-') && !imageCode.startsWith('E03-'))) {
            imageUrl = 'https://static.fw.dbscards.fr/cards/common/back-energy.webp';
          }
        }
        
        return {
          id: cardNumber || `unknown_${i}`,
          index: i + 1,
          name: name || 'Unknown Name',
          cardNumber: cardNumber || 'Unknown',
          rarity: rarity || 'C',
          type: type || 'Battle',
          color: color || 'Red',
          expansion: expansionId || 'BT1',
          imageUrl: imageUrl,
          backImageUrl: backImageUrl,
          isFoil: ['SR', 'SPR', 'SCR', 'GDR', 'RLR', 'PRW', 'LEADER RARE', 'L*', 'C*', 'UC*', 'R*', 'SR*', 'SCR*', 'SCR**'].includes(rarity),
          ...(SET_METADATA[cardNumber] || SET_METADATA[expansionId] || {})
        };
      });
      
      setCards(parsedCards);
    };

    loadCards();
  }, [gameType]);


  // Separate inventory listener to prevent redundant re-subscriptions on game/group change
  useEffect(() => {
    if (user && !isQuotaExceeded) {
      setIsInventoryLoading(true);
      console.log("[Firestore] Subscribing to inventory...");
      const q = query(collection(db, 'inventory'), where('ownerId', '==', user.uid));
      const unsubscribeInv = onSnapshot(q, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
          setInventory(items);
          setIsInventoryLoading(false);
          console.log(`[Firestore] Inventory updated: ${items.length} items.`);
        },
        (error) => {
          setIsInventoryLoading(false);
          handleFirestoreError(error, OperationType.LIST, 'inventory');
        }
      );

      return () => unsubscribeInv();
    } else {
      setIsInventoryLoading(false);
      if (!user) setInventory([]);
    }
  }, [user?.uid, isQuotaExceeded]);

  // Separate achievements listener
  useEffect(() => {
    if (user && !isQuotaExceeded) {
      console.log("[Firestore] Subscribing to achievements...");
      const qAch = query(collection(db, 'achievements'), where('ownerId', '==', user.uid));
      const unsubscribeAch = onSnapshot(qAch, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAchievement));
          setUserAchievements(items);
          achievementsLoaded.current = true;
          console.log(`[Firestore] Achievements updated: ${items.length} items.`);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'achievements');
        }
      );

      return () => unsubscribeAch();
    }
  }, [user?.uid, isQuotaExceeded]);

  // Handle achievement notifications (unseen logic)
  useEffect(() => {
    if (!user || userAchievements.length === 0 || achievementsList.length === 0) return;
    
    // Identify unseen achievements for notification on login
    const unseen = userAchievements.filter(a => {
      const tierKey = a.currentTier !== undefined ? `${a.achievementId}_tier_${a.currentTier}` : a.achievementId;
      return a.isSeen === false && !processedAchievementIds.current.has(tierKey);
    });

    if (unseen.length > 0 && unlockedQueue.length === 0 && !unlockedAchievement) {
      // Re-check seen status before adding to queue using tier-aware keys
      const toQueue = unseen.map(a => {
        const def = achievementsList.find(d => d.id === a.achievementId);
        if (!def) return null;
        const tierKey = a.currentTier !== undefined ? `${a.achievementId}_tier_${a.currentTier}` : a.achievementId;
        if (processedAchievementIds.current.has(tierKey)) return null;
        return { def, tierKey, ach: a };
      }).filter((x): x is { def: AchievementDef, tierKey: string, ach: UserAchievement } => x !== null);
      
      if (toQueue.length > 3) {
        setNewAchievementsCount(toQueue.length);
        const batch = writeBatch(db);
        toQueue.forEach(item => {
          batch.update(doc(db, 'achievements', item.ach.id), { isSeen: true });
          processedAchievementIds.current.add(item.tierKey);
        });
        batch.commit().catch(err => {
          if (!isQuotaError(err)) console.error("Achievement batch fail", err);
        });
      } else if (toQueue.length > 0) {
        toQueue.forEach(item => {
          processedAchievementIds.current.add(item.tierKey);
          updateDoc(doc(db, 'achievements', item.ach.id), { isSeen: true })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `achievements/${item.ach.id}`));
        });
        setUnlockedQueue(prev => {
          const newItems = toQueue.map(t => ({ def: t.def, tier: t.ach.currentTier })).filter(item => 
            !prev.some(a => a.def.id === item.def.id && a.tier === item.tier) && 
            !(unlockedAchievement?.def.id === item.def.id && unlockedAchievement?.tier === item.tier)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [userAchievements, user, achievementsList, unlockedAchievement, unlockedQueue.length]);

  // AUTO-SYNC STATS ON LOGIN
  // This ensures that even users who signed up before denormalization was added
  // get their stats populated in the 'users' document for the ranking.
  useEffect(() => {
    if (user && inventory.length > 0 && profile && !isQuotaExceeded) {
      if (!profile.lastStatsUpdate || !profile.uniqueCards) {
        console.log("[Auto-Sync] Backfilling stats for older user profile...");
        const uniqueCards = inventory.filter(i => i.quantity > 0).length;
        const totalCards = inventory.reduce((sum, i) => sum + i.quantity, 0);
        
        updateDoc(doc(db, 'users', user.uid), {
          uniqueCards,
          totalCards,
          lastStatsUpdate: serverTimestamp()
        }).catch(err => console.error("Auto-sync failed:", err));
      }
    }
  }, [user?.uid, inventory.length > 0, !!profile, isQuotaExceeded]);
  const lastProgressSent = useRef<Record<string, number>>({});
  const lastAchievementCheck = useRef<number>(0);

  // Check achievements logic
  useEffect(() => {
    if (!user || cards.length === 0 || inventory.length === 0 || isQuotaExceeded) return;

    const runChecks = async () => {
      // Throttle checks to once every 5 seconds to avoid hammering the DB
      const now = Date.now();
      if (now - lastAchievementCheck.current < 5000) return;
      lastAchievementCheck.current = now;

      if (!achievementsLoaded.current || achievementsList.length === 0) return;
      
      const addingInThisRun = new Set<string>();
      
      for (const def of achievementsList) {
        const { earned, progress, tier } = def.check(cards, inventory);
        const existing = userAchievementsRef.current.find(a => a.achievementId === def.id);

        if (earned) {
          const tierKey = tier !== undefined ? `${def.id}_tier_${tier}` : def.id;
          
          if (failedWrites.current.has(def.id)) continue;

          if (!existing && !addingInThisRun.has(def.id) && !processedAchievementIds.current.has(tierKey)) {
            console.log(`[ACHIEVEMENT] Unlocking unique: ${def.id}`);
            addingInThisRun.add(def.id);
            processedAchievementIds.current.add(tierKey);
            try {
              await addDoc(collection(db, 'achievements'), {
                achievementId: def.id,
                ownerId: user.uid,
                unlockedAt: serverTimestamp(),
                currentProgress: progress,
                currentTier: tier || 0,
                isSeen: false
              });
              // Add to queue for visual notification
              setUnlockedQueue(prev => {
                const alreadyQueued = prev.some(a => a.def.id === def.id && a.tier === (tier || 0));
                if (alreadyQueued || (unlockedAchievement?.def.id === def.id && unlockedAchievement?.tier === (tier || 0))) return prev;
                return [...prev, { def, tier: tier || 0 }];
              });
            } catch (err) {
              if (!handleFirestoreError(err, OperationType.CREATE, 'achievements')) {
                console.error("Failed to add achievement, skipping future retries this session", err);
              }
              failedWrites.current.add(def.id);
            }
          } else if (existing && (
            (def.type === 'tiered' && tier !== undefined && tier > (existing.currentTier || 0)) ||
            (progress !== undefined && progress > (existing.currentProgress || 0) && progress < 100)
          )) {
            // Update progress silently if it hasn't finished
            const tierIncreased = tier !== undefined && tier > (existing.currentTier || 0);
            
            if (tierIncreased) {
              const tierKeyUpdate = `${def.id}_tier_${tier}`;
              if (!processedAchievementIds.current.has(tierKeyUpdate)) {
                console.log(`[ACHIEVEMENT] Tiering up: ${def.id} to tier ${tier}`);
                processedAchievementIds.current.add(tierKeyUpdate);
                try {
                  await updateDoc(doc(db, 'achievements', existing.id), {
                    currentTier: tier,
                    currentProgress: progress,
                    unlockedAt: serverTimestamp(),
                    isSeen: false
                  });
                  setUnlockedQueue(prev => {
                    const alreadyQueued = prev.some(a => a.def.id === def.id && a.tier === tier);
                    if (alreadyQueued || (unlockedAchievement?.def.id === def.id && unlockedAchievement?.tier === tier)) return prev;
                    return [...prev, { def, tier }];
                  });
                } catch (err) {
                  if (!handleFirestoreError(err, OperationType.UPDATE, 'achievements')) {
                    console.error("Failed to update achievement tier, skipping future retries", err);
                  }
                  failedWrites.current.add(def.id);
                }
              }
            } else if (progress !== undefined && progress > (existing.currentProgress || 0)) {
               // Only update if difference is > 1% or it's the first time we update this session
               const lastSent = lastProgressSent.current[existing.id] || existing.currentProgress || 0;
               if (Math.abs(progress - lastSent) >= 1 || lastProgressSent.current[existing.id] === undefined) {
                 try {
                   lastProgressSent.current[existing.id] = progress;
                   // Update progress silently without notification
                   await updateDoc(doc(db, 'achievements', existing.id), {
                     currentProgress: progress
                   });
                 } catch (err) {
                   if (!handleFirestoreError(err, OperationType.UPDATE, 'achievements')) {
                     console.error("Failed to update achievement progress, skipping future retries", err);
                   }
                   failedWrites.current.add(def.id);
                 }
               }
            }
          }
        }
      }
    };

    const timer = setTimeout(runChecks, 5000); // 5 second buffer to prevent hammering
    return () => clearTimeout(timer);
  }, [inventory, cards, user, isQuotaExceeded]);

  const handleLogin = () => {
    if (isQuotaExceeded) {
      alert(lang === 'es' 
        ? 'El límite de tráfico diario ha sido alcanzado. Inténtalo de nuevo mañana.' 
        : 'Daily traffic limit reached. Please try again tomorrow.');
      return;
    }
    signInWithPopup(auth, googleProvider).catch((error) => {
      console.error("Login failed:", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        alert(lang === 'es' ? `Error al iniciar sesión: ${error.message}` : `Login failed: ${error.message}`);
      }
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaExceeded) {
      setEmailAuth(p => ({...p, error: lang === 'es' ? 'El límite de tráfico diario ha sido alcanzado. Inténtalo de nuevo mañana.' : 'Daily traffic limit reached.'}));
      return;
    }
    
    if (!emailAuth.email || !emailAuth.password) {
      setEmailAuth(p => ({...p, error: lang === 'es' ? 'Rellena todos los campos.' : 'Please fill all fields.'}));
      return;
    }
    
    try {
      if (emailAuth.isLogin) {
        await signInWithEmailAndPassword(auth, emailAuth.email, emailAuth.password);
      } else {
        await createUserWithEmailAndPassword(auth, emailAuth.email, emailAuth.password);
      }
      setEmailAuth({ email: '', password: '', isLogin: true, error: '' });
    } catch (error: any) {
      console.error("Auth failed:", error);
      // Simplify error message for user
      let errMsg = error.message;
      if (error.code === 'auth/invalid-credential') errMsg = lang === 'es' ? 'Credenciales incorrectas' : 'Invalid credentials';
      if (error.code === 'auth/email-already-in-use') errMsg = lang === 'es' ? 'El email ya está en uso' : 'Email already in use';
      if (error.code === 'auth/weak-password') errMsg = lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password should be at least 6 characters';
      
      setEmailAuth(p => ({...p, error: errMsg}));
    }
  };
  const handleLogout = () => signOut(auth);

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim() || !user) return;
    setIsSendingFeedback(true);
    try {
      // 1. Intentamos guardar en Firestore como backup (si hay cuota)
      if (!isQuotaExceeded) {
        try {
          await addDoc(collection(db, 'feedback'), {
            userId: user.uid,
            userEmail: user.email,
            message: feedbackMessage.trim(),
            createdAt: serverTimestamp(),
          });
        } catch (fErr) {
          console.warn("Could not save feedback to Firestore due to quota/error, but proceeding with email", fErr);
        }
      }

      // 2. Intentamos enviar el correo si las claves están configuradas
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: user.displayName || user.email,
            from_email: user.email,
            message: feedbackMessage.trim(),
            to_email: 'anulix1983@gmail.com', // Tu correo fijo
            reply_to: user.email,
          },
          publicKey
        );
      }

      setFeedbackMessage('');
      setIsFeedbackModalOpen(false);
      alert('¡Gracias por tu feedback! Nos ayuda mucho a mejorar la app.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'feedback');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleExportUsers = async () => {
    if (!user || user.email !== 'anulix1983@gmail.com' || isQuotaExceeded) return;
    setIsExporting(true);
    try {
      const usersCol = collection(db, 'users');
      let snapshot;
      try {
        snapshot = await getDocs(usersCol);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
        return;
      }
      const userList = snapshot.docs.map(doc => {
        const data = doc.data();
        return `- ${data.displayName} (${data.email || 'No email'})`;
      }).join('\n');

      const messageContent = `Reporte de Usuarios Registrados (${snapshot.size}):\n\n${userList}`;

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: 'DBS Tracker Admin',
            from_email: 'system@dbstracker.com',
            message: messageContent,
            to_email: 'anulix1983@gmail.com',
          },
          publicKey
        );
        alert(`Se ha enviado la lista de ${snapshot.size} usuarios a tu correo.`);
      } else {
        alert('Configuración de EmailJS no encontrada.');
      }
    } catch (error) {
      console.error("Error exporting users:", error);
      alert('Error al exportar usuarios.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNextCard = () => {
    const list = activeTab === 'search' ? globalSearchResults : filteredCards;
    if (!selectedCard || list.length <= 1) return;
    
    const currentIndex = list.findIndex(c => c.id === selectedCard.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % list.length;
    setSelectedCard(list[nextIndex]);
    setIsFlipped(false);
    setShowDetails(false);
  };

  const handlePrevCard = () => {
    const list = activeTab === 'search' ? globalSearchResults : filteredCards;
    if (!selectedCard || list.length <= 1) return;
    
    const currentIndex = list.findIndex(c => c.id === selectedCard.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    setSelectedCard(list[prevIndex]);
    setIsFlipped(false);
    setShowDetails(false);
  };

  // Keyboard navigation for card detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCard) return;
      if (e.key === 'ArrowRight') handleNextCard();
      if (e.key === 'ArrowLeft') handlePrevCard();
      if (e.key === 'Escape') setSelectedCard(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, handleNextCard, handlePrevCard]);

  const handleUpdateQuantity = async (cardId: string, delta: number) => {
    if (!user || isQuotaExceeded) return;
    
    try {
      // OPTIMIZATION: Use local state instead of getDocs to find existing item
      // This saves 1 read(!!!) per interaction.
      const existingItem = inventory.find(i => i.cardId === cardId);
      
      let newInventoryState: InventoryItem[] | null = null;
      
      if (!existingItem) {
        if (delta > 0) {
          const docData = {
            cardId,
            ownerId: user.uid,
            quantity: delta,
            addedAt: serverTimestamp()
          };
          
          await addDoc(collection(db, 'inventory'), docData);
          // Calculate stats for new item manually to update profile immediately
          newInventoryState = [...inventory, { ...docData, id: 'temp', addedAt: new Date() } as any];
          
          // Notify admin if someone finds the secret P-005_PR card
          if (cardId === 'P-005_PR' && user.email !== 'anulix1983@gmail.com') {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (serviceId && templateId && publicKey) {
              emailjs.send(
                serviceId,
                templateId,
                {
                  from_name: 'DBS Tracker System',
                  from_email: 'system@dbstracker.com',
                  message: `🏆 ¡LOGRO OCULTO! El usuario ${user.displayName || user.email || 'Anónimo'} (${user.email}) ha encontrado la P-005_PR.`,
                  to_email: 'anulix1983@gmail.com',
                  reply_to: user.email,
                },
                publicKey
              ).catch(e => console.error("Error notifying winner:", e));
            }
          }
        } else {
          return;
        }
      } else {
        const itemDocId = existingItem.id;
        const newQuantity = Math.max(0, existingItem.quantity + delta);
        
        if (newQuantity === 0) {
          await deleteDoc(doc(db, 'inventory', itemDocId));
          newInventoryState = inventory.filter(i => i.id !== itemDocId);
        } else {
          await updateDoc(doc(db, 'inventory', itemDocId), {
            quantity: newQuantity
          });
          newInventoryState = inventory.map(i => i.id === itemDocId ? { ...i, quantity: newQuantity } : i);
        }
      }

      // Denormalize stats to user profile to avoid expensive inventory scans for rankings
      // This massively reduces reads for common UI elements.
      if (newInventoryState) {
        const uniqueCards = newInventoryState.filter(i => i.quantity > 0).length;
        const totalCards = newInventoryState.reduce((sum, i) => sum + i.quantity, 0);
        
        updateDoc(doc(db, 'users', user.uid), {
          uniqueCards,
          totalCards,
          lastStatsUpdate: serverTimestamp()
        }).catch(err => {
          if (!handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`)) {
            console.error("Failed to update user stats:", err);
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inventory');
    }
  };

  const getExpansionName = (id: string) => {
    if (id === 'Todos') return 'Todos';
    for (const group of currentGroups) {
      const item = group.items.find(i => i.id === id);
      if (item) return typeof item.label === 'string' ? item.label : (item.label as any)[lang] || (item.label as any).en || item.label;
      
      // Check subItems
      for (const it of group.items) {
        if (it.subItems) {
          const sub = it.subItems.find(s => s.id === id);
          if (sub) return typeof sub.label === 'string' ? sub.label : (sub.label as any)[lang] || (sub.label as any).en || sub.label;
        }
      }
    }
    return id;
  };

  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm"
        style={{ backgroundImage: 'url("/fondo portada.jpg")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#121212]/30 to-[#121212]/90" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full relative z-10"
      >
        <>
          <div className="w-32 h-32 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(234,88,12,0.4)] overflow-hidden border-2 border-white/10">
            <img 
              src="/portada.jpg" 
              alt="DBS Tracker" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase italic drop-shadow-lg">DBS<span className="text-orange-500">TRACKER</span></h1>
          <p className="text-gray-300 mb-8 leading-relaxed px-4 text-sm font-medium drop-shadow-md">Gestiona tu colección de Dragon Ball Super Card Game con estilo. Inventario en tiempo real, seguimiento de colecciones y más.</p>
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-white text-black font-black rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl uppercase tracking-tighter"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Entrar con Google
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lang === 'es' ? 'O usa tu email' : 'Or use email'}</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={emailAuth.email}
                onChange={e => setEmailAuth(p => ({...p, email: e.target.value}))}
                className="w-full px-4 py-3 bg-black/40 border-2 border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder={lang === 'es' ? 'Contraseña' : 'Password'}
                value={emailAuth.password}
                onChange={e => setEmailAuth(p => ({...p, password: e.target.value}))}
                className="w-full px-4 py-3 bg-black/40 border-2 border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                autoComplete="current-password"
              />
              {emailAuth.error && (
                <p className="text-red-400 text-xs font-bold text-center">{emailAuth.error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl uppercase tracking-tighter mt-1"
              >
                {emailAuth.isLogin ? (lang === 'es' ? 'Entrar' : 'Sign In') : (lang === 'es' ? 'Crear cuenta' : 'Create Account')}
              </button>
            </form>
            
            <button
              type="button"
              onClick={() => setEmailAuth(p => ({...p, isLogin: !p.isLogin, error: ''}))}
              className="mt-2 text-xs font-bold text-gray-400 hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
            >
              {emailAuth.isLogin 
                ? (lang === 'es' ? '¿No tienes cuenta? Regístrate aquí' : "Don't have an account? Sign up here")
                : (lang === 'es' ? '¿Ya tienes cuenta? Entra aquí' : "Already have an account? Sign in here")}
            </button>
          </div>
        </>
      </motion.div>
    </div>
  );

  if (profile && !profile.hasAcceptedTerms) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-black to-black opacity-60"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-orange-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {lang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}
            </h2>
          </div>
          
          <div className="overflow-y-auto pr-4 mb-8 space-y-6 text-gray-300 text-sm leading-relaxed custom-scrollbar flex-1 border border-white/5 rounded-2xl p-6 bg-black/40">
            <section>
              <h3 className="text-white font-bold text-base mb-2">{lang === 'es' ? '1. Uso de la Aplicación' : '1. App Usage'}</h3>
              <p>{lang === 'es' ? 'DBS Tracker es una aplicación no oficial creada por fans para gestionar colecciones del Dragon Ball Super Card Game. Todos los derechos de imágenes y nombres de las cartas pertenecen a Bandai Co., Ltd. y Bird Studio/Shueisha, Toei Animation.' : 'DBS Tracker is an unofficial fan-made app for managing Dragon Ball Super Card Game collections. All rights to card images and names belong to Bandai Co., Ltd. and Bird Studio/Shueisha, Toei Animation.'}</p>
            </section>
            
            <section>
              <h3 className="text-white font-bold text-base mb-2">{lang === 'es' ? '2. Privacidad de Datos' : '2. Data Privacy'}</h3>
              <p>{lang === 'es' ? 'Tu información de inicio de sesión, inventario y estadísticas se almacenan de forma segura en Google Cloud (Firebase). No compartimos ni vendemos tu información personal a terceros. Los datos recabados se utilizan exclusivamente para el funcionamiento de la aplicación.' : 'Your login info, inventory, and stats are securely stored on Google Cloud (Firebase). We do not share or sell your personal information to third parties. Collected data is used exclusively for the application\'s operation.'}</p>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-2">{lang === 'es' ? '3. Disponibilidad y Servicio' : '3. Availability and Service'}</h3>
              <p>{lang === 'es' ? 'Esta herramienta es gratuita y hacemos un gran esfuerzo para mantenerla online de forma continua, pero se proporciona "tal cual". Podría experimentar tiempos de inactividad o pérdida de datos. No nos hacemos responsables por eventuales discrepancias en tu inventario.' : 'This tool is free and we make a great effort to keep it continuously online, but it is provided "as is". You might experience downtime or data loss. We are not responsible for eventual discrepancies in your inventory.'}</p>
            </section>

            <section>
              <h3 className="text-white font-bold text-base mb-2">{lang === 'es' ? '4. Conducta' : '4. Conduct'}</h3>
              <p>{lang === 'es' ? 'El abuso del sistema, incluyendo múltiples cuentas automatizadas, extracción masiva de datos (scraping) u otra acción que perjudique el servidor, resultará en el acceso denegado.' : 'System abuse, including multiple automated accounts, data scraping, or any action that harms the server, will result in access denial.'}</p>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-white/5 pt-6">
            <button 
              onClick={() => signOut(auth)}
              className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 active:scale-95 transition-all uppercase tracking-wider text-sm flex justify-center items-center gap-2"
            >
              <X size={18} />
              {lang === 'es' ? 'Rechazar y Salir' : 'Decline & Exit'}
            </button>
            <button 
              onClick={async () => {
                await updateDoc(doc(db, 'users', user.uid), { 
                  hasAcceptedTerms: true,
                  acceptedTermsAt: serverTimestamp()
                });
              }}
              className="flex-1 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-500 active:scale-95 transition-all shadow-xl uppercase tracking-wider text-sm flex justify-center items-center gap-2 border border-orange-500/50"
            >
              <CheckCircle2 size={18} />
              {lang === 'es' ? 'Aceptar y Entrar' : 'Accept & Enter'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 pb-32 font-sans">
      {/* Quota Exceeded Warning - Only visible to owner */}
      {isQuotaExceeded && user?.email === 'anulix1983@gmail.com' && (
        <div className="fixed top-0 inset-x-0 z-[1000] flex flex-col items-center">
          <button 
             onClick={() => setShowQuotaDetails(!showQuotaDetails)}
             className="bg-red-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 rounded-b shadow-xl border-x border-b border-red-500 hover:bg-red-500 transition-colors"
          >
             <Zap size={14} className={showQuotaDetails ? "" : "animate-pulse"} />
             <span>{showQuotaDetails ? 'Ocultar Alerta de Cuota' : 'ALERTA DE CUOTA EXCEDIDA (Pulsar para ver)'}</span>
          </button>
          
          {showQuotaDetails && (
            <div className="bg-red-600 w-full text-white p-3 text-[10px] flex flex-col items-center justify-center gap-2 shadow-xl border-b border-red-500 mt-0">
               <div className="flex items-center justify-center gap-4 w-full">
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                    <Zap size={14} className="animate-pulse" />
                    <span>ERROR DE RECURSOS (PLATAFORMA). Si estás en el Plan Blaze, revisa tus límites de presupuesto o cuotas en la Google Cloud Console.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setIsQuotaExceeded(false);
                        window.location.reload();
                      }}
                      className="px-3 py-1 bg-white text-red-600 hover:bg-white/90 font-bold rounded shadow-sm transition-colors uppercase tracking-widest"
                    >
                      Reintentar
                    </button>
                  </div>
               </div>
               
              <div className="max-w-2xl mx-auto mt-3 w-full bg-black/30 p-3 rounded border border-white/10 normal-case font-normal text-[11px] whitespace-pre-wrap leading-relaxed">
                <div className="font-bold text-red-300 mb-1 border-b border-white/10 pb-1">DIAGNÓSTICO TÉCNICO:</div>
                {quotaErrorMessage 
                  ? `Error Original: ${quotaErrorMessage}\n\nSi estás en el Plan Blaze y ves "Google Maps Platform Transition Account", es probable que tu proyecto esté vinculado a una cuenta de facturación heredada o restringida que ignora el plan de Firebase.\n\nDebes ir a Google Cloud Console > Facturación y asegurarte de que el proyecto esté vinculado a una CUENTA DE FACTURACIÓN PERSONAL ACTIVA con tarjeta de crédito válida.`
                  : "No se capturó el mensaje de error específico, pero Firebase ha denegado la solicitud por falta de cuota o recursos.\n\nSi estás en el Plan Blaze, revisa tus límites de presupuesto en la Google Cloud Console y asegúrate de que el Administrador de la Cuenta de Facturación (Google Maps Transition) te haya dado permisos o vincula el proyecto a una nueva cuenta."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Language Selector Overlay for New Users */}
      <AnimatePresence>
        {showLanguageSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs w-full space-y-8"
            >
              <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.2)] overflow-hidden border-2 border-yellow-400">
                <Globe size={40} className="text-yellow-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter italic">Selecciona Idioma</h2>
                <p className="text-gray-400 text-sm">Select your language</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleLanguageSelect('es')}
                  className="group relative flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🇪🇸</span>
                    <span className="font-bold text-white group-hover:text-yellow-400 transition-colors uppercase italic tracking-tighter">Español</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-yellow-400" />
                </button>

                <button
                  onClick={() => handleLanguageSelect('en')}
                  className="group relative flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🇺🇸</span>
                    <span className="font-bold text-white group-hover:text-yellow-400 transition-colors uppercase italic tracking-tighter">English</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-yellow-400" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#1E1E1E]/80 backdrop-blur-md z-40 border-b border-white/5 px-4 py-3 max-w-md mx-auto rounded-b-2xl shadow-xl sm:max-w-none sm:rounded-none">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            {activeTab === 'collection' && (currentCollectionCategory !== null || filters.expansion !== 'Todos') && (
              <button 
                onClick={() => {
                  if (filters.expansion !== 'Todos') {
                    setFilters({...filters, expansion: 'Todos'});
                  } else if (currentCollectionSubCategory !== null) {
                    let parentLabel = null;
                    const findParent = (items: any[], currentLabel: string, currentParentLabel: string | null) => {
                      for (const item of items) {
                        if (item.label === currentLabel || item.id === currentLabel) {
                          parentLabel = currentParentLabel;
                          return true;
                        }
                        if (item.subItems) {
                          if (findParent(item.subItems, currentLabel, item.label)) return true;
                        }
                      }
                      return false;
                    };
                    for (const group of currentGroups) {
                      if (findParent(group.items, currentCollectionSubCategory, null)) break;
                    }
                    if (parentLabel && parentLabel !== 'Store Events' && parentLabel !== 'Championship' && parentLabel !== 'Coleccionismo' && parentLabel !== 'Promos') {
                      setCurrentCollectionSubCategory(parentLabel);
                    } else {
                      // If we are already at the top of the subcategory tree, stay in the category!
                      setCurrentCollectionSubCategory(null);
                    }
                  } else {
                    setCurrentCollectionCategory(null);
                  }
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-orange-500 hover:bg-orange-500/10 transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'es' ? 'VOLVER' : 'BACK'}</span>
              </button>
            )}

            <button 
              onClick={() => {
                const newType = gameType === 'masters' ? 'fusion' : 'masters';
                setGameType(newType);
                localStorage.setItem('gameType', newType);
                localStorage.setItem('lastGameSelectionDate', new Date().toDateString());
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                gameType === 'fusion' 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500' 
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
              }`}
            >
              <Zap size={12} />
              <span className="text-[10px] font-black uppercase tracking-tight">
                {gameType === 'fusion' ? 'Fusion World' : 'Masters'}
              </span>
            </button>

            {/* Goal Toggle Mini */}
            <button 
              onClick={() => {
                const newGoal = collectionGoal === 'collector' ? 'player' : 'collector';
                setCollectionGoal(newGoal);
                if (user) updateProfileFields({ collectionGoal: newGoal });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                collectionGoal === 'player' 
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' 
                  : 'bg-white/5 border-white/5 text-gray-500'
              }`}
            >
              {collectionGoal === 'player' ? <Sword size={12} /> : <Library size={12} />}
              <span className="text-[10px] font-black uppercase tracking-tight">
                {collectionGoal === 'player' ? t.player : t.collector}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'collection' && filters.expansion !== 'Todos' && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-orange-400 text-black' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Search size={22} />
              </motion.button>
            )}

            <button 
              id="tour-nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all bg-white/5 flex items-center justify-center ${activeTab === 'profile' ? 'border-orange-500 db-glow-orange' : 'border-white/10'}`}
            >
              <img 
                src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`;
                }}
              />
            </button>
          </div>
        </div>

        {/* Full-width Search Bar Dropdown */}
        <AnimatePresence>
          {isSearchOpen && activeTab === 'collection' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden w-full"
            >
              <div className="pt-3 pb-1 px-6">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder={(() => {
                      if (filters.expansion === 'Todos') return t.searchPlaceholder;
                      const findExpansionName = (items: any[]): string | undefined => {
                        for (const item of items) {
                          if (item.id === filters.expansion) return item.label;
                          if (item.subItems) {
                            const found = findExpansionName(item.subItems);
                            if (found) return found;
                          }
                        }
                      };
                      let expName = undefined;
                      for (const group of currentGroups) {
                        expName = findExpansionName(group.items);
                        if (expName) break;
                      }
                      return expName ? `${lang === 'es' ? 'Buscar en' : 'Search in'} ${expName}...` : t.searchPlaceholder;
                    })()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20 px-4 max-w-5xl mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <Dashboard 
              cards={cards} 
              inventory={inventory} 
              collectionGoal={collectionGoal}
              lang={lang}
              recentlyAddedCards={recentlyAddedCards}
              setSelectedCard={setSelectedCard}
              isMultiSelectMode={isMultiSelectMode}
              selectedCardIds={selectedCardIds}
              handleLongPress={handleLongPress}
              toggleCardSelection={toggleCardSelection}
              isInventoryLoading={isInventoryLoading}
            />
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="space-y-6">
            {filters.expansion === 'Todos' ? (
              <div className="space-y-8">
                {currentCollectionCategory === null ? (
                  /* Level 0: Main Categories */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {currentCategories.map(cat => {
                      let bgImage = CATEGORY_BG[cat.id];
                      if (!bgImage && cat.categories) {
                        const targetCatName = cat.categories[0];
                        const group = currentGroups.find(g => g.category === targetCatName);
                        if (group && group.items && group.items.length > 0) {
                           let firstId = group.items[0].id;
                           if (group.items[0].subItems && group.items[0].subItems.length > 0) {
                             firstId = group.items[0].subItems[0].id;
                           }
                           const firstCards = cards.filter(c => c.expansion === firstId || (PACK_ARRAYS[firstId] && PACK_ARRAYS[firstId].includes(c.id)) || (firstId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${firstId}`]?.includes(c.id)) || (firstId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)));
                           if (firstCards.length > 0) {
                             bgImage = firstCards[0].imageUrl;
                             if (bgImage && !bgImage.startsWith('http') && !bgImage.startsWith('/')) {
                                bgImage = '/' + bgImage;
                             }
                           }
                        }
                      }
                      
                      const isLocked = (cat as any).locked;
                      const label = lang === 'es' ? cat.label.es : cat.label.en;
                      const displayLabel = isLocked ? `${label} (Próximamente)` : label;
                      
                      return (
                        <motion.button
                          key={cat.id}
                          whileHover={!isLocked ? { y: -4 } : {}}
                          whileTap={!isLocked ? { scale: 0.98 } : {}}
                          disabled={isLocked}
                          onClick={() => {
                            if (isLocked) return;
                            if (cat.id === 'promos') {
                               setFilters({...filters, expansion: 'FP'});
                            } else if (cat.id === 'energy-markers') {
                               setFilters({...filters, expansion: 'ENM_FW'});
                            } else {
                               setCurrentCollectionCategory(cat.id);
                               setCurrentCollectionSubCategory(null);
                            }
                            window.scrollTo(0, 0);
                          }}
                          className={`group relative bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col items-start gap-4 transition-all ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-orange-500/30'}`}
                        >
                          {bgImage && (
                            <>
                              <img 
                                src={bgImage}
                                loading="lazy"
                                decoding="async"
                                alt=""
                                style={{ contentVisibility: 'auto' }}
                                className={`absolute inset-0 w-full h-full object-cover z-0 ${['decks', 'expansions', 'promos', 'energy-markers'].includes(cat.id) ? 'object-[50%_25%]' : 'object-center'} opacity-15 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500`}
                              />
                              <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent to-[#1E1E1E]/60 pointer-events-none" />
                            </>
                          )}
                          <div className="relative z-10 w-full flex flex-col items-start gap-4">
                            <div className="w-14 h-14" />
                            <div className="space-y-1">
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter text-left">
                                {displayLabel}
                              </h3>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  /* Level 1: Categories and Subcategories */
                  <div className="space-y-6">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                            {(() => {
                              const cat = currentCategories.find(c => c.id === currentCollectionCategory);
                              if (!cat) return '';
                              
                              if (currentCollectionSubCategory) {
                                // Find readable label for subcategory
                                for (const group of currentGroups) {
                                  if (cat.categories.includes(group.category)) {
                                    const item = group.items.find(i => i.id === currentCollectionSubCategory || i.label === currentCollectionSubCategory);
                                    if (item) {
                                      if (typeof item.label === 'string') return item.label;
                                      return item.label[lang];
                                    }
                                    
                                    // Search in subItems
                                    for (const it of group.items) {
                                      const sub = it.subItems?.find(s => s.id === currentCollectionSubCategory);
                                      if (sub) return sub.label;
                                    }
                                  }
                                }
                                return currentCollectionSubCategory;
                              }
                              
                              return cat.label[lang];
                            })()}
                          </h3>
                        </div>
                        <button 
                          onClick={() => {
                            if (currentCollectionSubCategory) {
                              let parentLabel = null;
                              const findParent = (items, currentLabel, currentParentLabel) => {
                                for (const item of items) {
                                  if (item.label === currentLabel) {
                                    parentLabel = currentParentLabel;
                                    return true;
                                  }
                                  if (item.subItems) {
                                    if (findParent(item.subItems, currentLabel, item.label)) return true;
                                  }
                                }
                                return false;
                              };
                              for (const group of currentGroups) {
                                if (findParent(group.items, currentCollectionSubCategory, null)) break;
                              }
                              if (parentLabel && parentLabel !== 'Store Events' && parentLabel !== 'Championship' && parentLabel !== 'Coleccionismo' && parentLabel !== 'Promos') {
                                setCurrentCollectionSubCategory(parentLabel);
                              } else {
                                setCurrentCollectionSubCategory(null);
                              }
                            } else {
                              setCurrentCollectionCategory(null);
                            }
                          }}
                          className="bg-white/5 p-2 rounded-xl text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <ChevronLeft size={24} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(() => {
                          const category = currentCategories.find(c => c.id === currentCollectionCategory);
                          if (!category) return null;

                          // DIRECT LIST (Expansions, Playmats, Fusion Boxes, Championship, Anniversary)
                          if (!currentCollectionSubCategory && (['expansions', 'playmats', 'anniversary', 'serial-cards', 'sleeves'].includes(currentCollectionCategory || '') || (['box', 'decks'].includes(currentCollectionCategory || '') && gameType === 'fusion'))) {
                             const sets = (currentGroups
                              .filter(g => category.categories.includes(g.category))
                              .flatMap(g => g.items)) as ExpansionItem[];
                             
                             return (
                               <div className="space-y-4">
                                 {sets.map(set => {
                                   if (set.subItems) {
                                     const fallbackBg = set.subItems[0] ? SET_BG[set.subItems[0].id] : undefined;
                                     let internalCardFallback: string | undefined;
                                     if (!fallbackBg && !SET_BG[set.id] && set.subItems[0]) {
                                       const firstSubItemId = set.subItems[0].id;
                                       const cardsInSubSet = cards.filter(c => c.expansion === firstSubItemId || (PACK_ARRAYS[firstSubItemId] && PACK_ARRAYS[firstSubItemId].includes(c.id)) || (firstSubItemId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${firstSubItemId}`]?.includes(c.id)) || (firstSubItemId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)));
                                       const firstCardImage = cardsInSubSet[0]?.imageUrl;
                                       internalCardFallback = firstCardImage ? (firstCardImage.startsWith('http') || firstCardImage.startsWith('/') ? firstCardImage : `/${firstCardImage}`) : undefined;
                                     }
                                     const bgImage = SET_BG[set.id] || fallbackBg || internalCardFallback || CATEGORY_BG[currentCollectionCategory || ''];
                                     const fallbackBgPos = set.subItems[0] ? SET_BG_POS[set.subItems[0].id] : undefined;
                                     const bgPos = SET_BG_POS[set.id] || fallbackBgPos || (['decks', 'expansions', 'promos', 'energy-markers'].includes(currentCollectionCategory || '') ? 'bg-[50%_25%]' : 'bg-center');

                                     return (
                                       <button 
                                         key={set.id}
                                         onClick={() => setCurrentCollectionSubCategory(set.label)}
                                         className="relative w-full p-5 bg-[#1E1E1E] rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between group shadow-xl overflow-hidden text-left"
                                       >
                                         {bgImage && (
                                           <img 
                                             src={bgImage}
                                             loading="lazy"
                                             alt=""
                                             className={`absolute inset-0 w-full h-full object-cover z-0 ${bgPos.replace('bg-[50%_25%]', 'object-[50%_25%]').replace('bg-center', 'object-center').replace('bg-top', 'object-top')} opacity-15 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500`}
                                           />
                                         )}
                                         <div className="relative z-10 flex items-center flex-1 mr-4">
                                           <span className="text-xs font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight italic text-left">{set.label}</span>
                                         </div>
                                         <ChevronRight size={20} className="text-gray-700 group-hover:text-orange-400" />
                                       </button>
                                     );
                                   }
                                   
                                   const cardsInSet = cards.filter(c => c.expansion === set.id || (PACK_ARRAYS[set.id] && PACK_ARRAYS[set.id].includes(c.id)) || (set.id.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${set.id}`]?.includes(c.id)) || (set.id === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)));
                                  let neededInSet = 0;
                                  let ownedInSet = 0;
                                  cardsInSet.forEach(c => {
                                    const target = getTargetQuantity(c, collectionGoal);
                                    const quantity = inventory.find(i => i.cardId === c.id)?.quantity || 0;
                                    neededInSet += target;
                                    ownedInSet += Math.min(quantity, target);
                                  });
                                  const progress = neededInSet > 0 ? Math.round((ownedInSet / neededInSet) * 100) : 0;
                                  
                                  const firstCard = cardsInSet[0];
                                  const firstCardImage = firstCard ? firstCard.imageUrl : undefined;
                                  const cardFallback = firstCardImage ? (firstCardImage.startsWith('http') || firstCardImage.startsWith('/') ? firstCardImage : `/${firstCardImage}`) : undefined;
                                  
                                  const bgImage = SET_BG[set.id] || cardFallback || CATEGORY_BG[currentCollectionCategory || ''];
                                  const bgPos = SET_BG_POS[set.id] || (['decks', 'expansions', 'promos', 'energy-markers'].includes(currentCollectionCategory || '') ? 'bg-[50%_25%]' : 'bg-center');

                                  return (
                                    <button 
                                      key={set.id}
                                      onClick={() => setFilters({...filters, expansion: set.id})}
                                      className="relative w-full p-5 bg-[#1E1E1E] rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between group shadow-xl overflow-hidden text-left"
                                    >
                                      {bgImage && (
                                        <img 
                                          src={bgImage}
                                          loading="lazy"
                                          alt=""
                                          className={`absolute inset-0 w-full h-full object-cover z-0 ${bgPos.replace('bg-[50%_25%]', 'object-[50%_25%]').replace('bg-center', 'object-center').replace('bg-top', 'object-top')} opacity-15 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500`}
                                        />
                                      )}
                                      <div className="relative z-10 flex items-center flex-1 mr-4">

                                        <span className="text-xs font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight italic text-left">{set.label}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-right">
                                          <p className="text-[12px] font-black text-gray-400">{progress}%</p>
                                          <div className="w-20 h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
                                          </div>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-700 group-hover:text-orange-400" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          }
                             // SUBCATEGORY GRID (Box, Decks, Coleccionismo, Tournament)
                          if (!currentCollectionSubCategory) {
                             const isColeccionismo = currentCollectionCategory === 'coleccionismo';
                             const isStoreEvents = currentCollectionCategory === 'store-events';
                             const isChampionship = currentCollectionCategory === 'championship';
                              
                             const subcategories = isColeccionismo
                               ? (currentGroups.find(g => g.category === 'Coleccionismo')?.items.filter(i => !i.isSubItem).map(i => i.label) || []) as string[]
                                : isStoreEvents
                                ? (currentGroups.find(g => g.category === 'Store Events')?.items.map(i => i.label) || []) as string[]
                                : isChampionship
                                ? (currentGroups.find(g => g.category === 'Championship')?.items.map(i => i.label) || []) as string[]
                                : category.categories;
                             
                             const Icon = currentCollectionCategory === 'box' ? Package : 
                                          currentCollectionCategory === 'decks' ? Layers : 
                                          currentCollectionCategory === 'store-events' ? Store : 
                                          currentCollectionCategory === 'championship' ? Trophy : 
                                          currentCollectionCategory === 'coleccionismo' ? Diamond : Library;
                              
                              return (
                               <div className={`grid ${(isStoreEvents || isChampionship || isColeccionismo) ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                 {subcategories.map(sub => {
                                   const expansionItem = isColeccionismo 
                                     ? currentGroups.find(g => g.category === 'Coleccionismo')?.items.find(i => i.label === sub)
                                     : isStoreEvents 
                                     ? currentGroups.find(g => g.category === 'Store Events')?.items.find(i => i.label === sub)
                                     : isChampionship
                                     ? currentGroups.find(g => g.category === 'Championship')?.items.find(i => i.label === sub)
                                     : null;
                                   
                                   const isLocked = expansionItem?.locked;
                                   const group = !isColeccionismo ? currentGroups.find(g => g.category === sub) : null;
                                   
                                   const searchBoxId = expansionItem ? expansionItem.id : (group?.items?.[0] ? group.items[0].id : null);
                                   let cardFallback: string | undefined;
                                   if (searchBoxId) {
                                     let targetIdForCards = searchBoxId;
                                     if (expansionItem?.subItems?.[0]) {
                                       targetIdForCards = expansionItem.subItems[0].id;
                                     } else if (group?.items?.[0]?.subItems?.[0]) {
                                       targetIdForCards = group.items[0].subItems[0].id;
                                     }
                                     const cardsInSet = cards.filter(c => c.expansion === targetIdForCards || (PACK_ARRAYS[targetIdForCards] && PACK_ARRAYS[targetIdForCards].includes(c.id)) || (targetIdForCards.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${targetIdForCards}`]?.includes(c.id)) || (targetIdForCards === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)));
                                     const firstCard = cardsInSet[0];
                                     const firstCardImage = firstCard ? firstCard.imageUrl : undefined;
                                     cardFallback = firstCardImage ? (firstCardImage.startsWith('http') || firstCardImage.startsWith('/') ? firstCardImage : `/${firstCardImage}`) : undefined;
                                   }

                                   const bgImage = (expansionItem && SET_BG[expansionItem.id]) || (expansionItem?.subItems?.[0] && SET_BG[expansionItem.subItems[0].id]) || (group && group.items[0] && SET_BG[group.items[0].id]) || cardFallback || CATEGORY_BG[currentCollectionCategory || ''];
                                   const bgPos = (expansionItem && SET_BG_POS[expansionItem.id]) || (expansionItem?.subItems?.[0] && SET_BG_POS[expansionItem.subItems[0].id]) || (group && group.items[0] && SET_BG_POS[group.items[0].id]) || (['decks', 'expansions', 'promos', 'energy-markers'].includes(currentCollectionCategory || '') ? 'bg-[50%_25%]' : 'bg-center');

                                   return (
                                     <motion.button
                                       key={sub}
                                       whileHover={isLocked ? {} : { y: -2 }}
                                       whileTap={isLocked ? {} : { scale: 0.98 }}
                                       disabled={isLocked}
                                       onClick={() => {
                                          if (isColeccionismo || isStoreEvents || isChampionship) {
                                            if (expansionItem) {
                                              if (expansionItem.subItems && expansionItem.subItems.length > 0) {
                                                setCurrentCollectionSubCategory(sub);
                                              } else {
                                                setFilters({...filters, expansion: expansionItem.id});
                                              }
                                            }
                                          } else {
                                            const group = currentGroups.find(g => g.category === sub);
                                            if (group && group.items.length === 1 && (!group.items[0].subItems || group.items[0].subItems.length === 0)) {
                                              setFilters({...filters, expansion: group.items[0].id});
                                            } else {
                                              setCurrentCollectionSubCategory(sub);
                                            }
                                          }
                                          window.scrollTo(0, 0);
                                       }}
                                       className={`relative bg-[#1E1E1E] p-6 rounded-2xl border border-white/5 flex flex-col items-start gap-4 shadow-2xl transition-all overflow-hidden ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500/30 group'}`}
                                     >
                                       {bgImage && (
                                         <>
                                           <img 
                                             src={bgImage}
                                             loading="lazy"
                                             decoding="async"
                                             alt=""
                                             style={{ contentVisibility: 'auto' }}
                                             className={`absolute inset-0 w-full h-full object-cover z-0 ${bgPos.replace('bg-[50%_25%]', 'object-[50%_25%]').replace('bg-center', 'object-center').replace('bg-top', 'object-top')} opacity-20 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500`}
                                           />
                                           <div className="absolute inset-0 z-1 bg-gradient-to-br from-[#1E1E1E]/40 to-transparent pointer-events-none" />
                                         </>
                                       )}
                                       <div className="relative z-10 w-full flex flex-col items-start gap-4">
                                         <div className="w-12 h-12" />
                                         <div className="flex flex-col items-start">
                                           <span className="text-xs font-black text-white uppercase tracking-tighter italic text-left leading-tight group-hover:text-orange-500 transition-colors">{sub}</span>
                                           {isLocked && <span className="text-[7px] bg-white/10 text-gray-500 px-1.5 py-0.5 rounded mt-1 font-bold">SOON</span>}
                                         </div>
                                       </div>
                                     </motion.button>
                                   );
                                 })}
                               </div>
                             );
                          }

                          // LEVEL 2 LIST OF SETS
                            const isColeccionismo = currentCollectionCategory === 'coleccionismo';
                            const isStoreEvents = currentCollectionCategory === 'store-events';
                            const isChampionship = currentCollectionCategory === 'championship';
                            const isPremium = false;
                            
                            let activeGroup;
                            if (isColeccionismo) {
                              const parent = currentGroups.find((g) => g.category === 'Coleccionismo')?.items.find((i) => i.label === currentCollectionSubCategory);
                              if (parent) {
                                activeGroup = { items: parent.subItems || [] };
                              }
                            } else {
                              const rootGroup = currentGroups.find((g) => g.category === currentCollectionSubCategory);
                              if (rootGroup) {
                                activeGroup = rootGroup;
                              } else {
                                const findSubcategoryItems = (items) => {
                                  for (const i of items) {
                                    if (i.label === currentCollectionSubCategory && i.subItems) {
                                      return { items: i.subItems };
                                    }
                                    if (i.subItems) {
                                      const found = findSubcategoryItems(i.subItems);
                                      if (found) return found;
                                    }
                                  }
                                  return null;
                                };
                                for (const group of currentGroups) {
                                  const foundGroup = findSubcategoryItems(group.items);
                                  if (foundGroup) {
                                    activeGroup = foundGroup;
                                    break;
                                  }
                                }
                              }
                            }
                          
                          if (!activeGroup || activeGroup.items.length === 0) return null;

                          return (
                            <div className="space-y-3">
                               {activeGroup.items.map((item, index) => {
                                 const cardsInSet = cards.filter(c => {
                                   if (isPremium) return c.id === item.id;
                                   const tags = getCardTags(c);
                                   const checkItemMatch = (checkItem: any): boolean => {
                                     if (checkItem.id === c.id) return true;
                                     if (c.expansion === checkItem.id) return true;
                                     if (PACK_ARRAYS[checkItem.id] && PACK_ARRAYS[checkItem.id].includes(c.id)) return true;
                                     if (checkItem.id.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${checkItem.id}`]?.includes(c.id)) return true;
                                     if (checkItem.id === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)) return true;
                                     if (checkItem.subItems) return checkItem.subItems.some((sub: any) => checkItemMatch(sub));
                                     return false;
                                   };
                                   if (item.id === 'COL02' || (item as any).isGiant) return tags.includes('giant');
                                   if (item.id === 'COL08') return tags.includes('serial');
                                   if (item.id === 'COL05') return tags.includes('event');
                                   if (item.id === 'COL06') return tags.includes('tournament');
                                   if (item.id === 'COL07') return tags.includes('judge');
                                   return checkItemMatch(item);
                                 });

                                 const isExpandable = !!item.subItems && item.subItems.length > 0;
                                 const isExpanded = expandedCategories.includes(item.id);

                                 let neededInSet = 0;
                                 let ownedInSet = 0;
                                 cardsInSet.forEach(c => {
                                   const target = getTargetQuantity(c, collectionGoal);
                                   const quantity = inventory.find(i => i.cardId === c.id)?.quantity || 0;
                                   neededInSet += target;
                                   ownedInSet += Math.min(quantity, target);
                                 });
                                 const progress = neededInSet > 0 ? Math.round((ownedInSet / neededInSet) * 100) : 0;
                                 
                                 const firstCard = cardsInSet[0];
                                 let firstCardImage = firstCard ? firstCard.imageUrl : undefined;
                                 if (!firstCardImage && item.subItems?.[0]) {
                                   const subId = item.subItems[0].id;
                                   const fallbackCards = cards.filter(c => c.expansion === subId || (PACK_ARRAYS[subId] && PACK_ARRAYS[subId].includes(c.id)) || (subId.startsWith('FB') && PACK_ARRAYS[`FP_RELEASE_${subId}`]?.includes(c.id)) || (subId === 'SB01' && PACK_ARRAYS['RE_SB01_FOLDER']?.includes(c.id)));
                                   firstCardImage = fallbackCards[0]?.imageUrl;
                                 }
                                 const cardFallback = firstCardImage ? (firstCardImage.startsWith('http') || firstCardImage.startsWith('/') ? firstCardImage : `/${firstCardImage}`) : undefined;
                                 
                                 const bgImage = SET_BG[item.id] || (item.subItems?.[0] && SET_BG[item.subItems[0].id]) || cardFallback || CATEGORY_BG[currentCollectionCategory || ''];
                                 const bgPos = SET_BG_POS[item.id] || (['decks', 'expansions', 'promos', 'energy-markers'].includes(currentCollectionCategory || '') ? 'bg-[50%_25%]' : 'bg-center');

                                 if (isPremium) {
                                   if (index > 0) return null;
                                   return (
                                     <div key={`premium-cards-wrapper-${item.id}`} className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                       {activeGroup.items.flatMap(i => cards.filter(c => c.cardNumber === i.id || c.id === i.id)).map(card => (
                                          <CardItem 
                                            key={card.id} 
                                            card={card} 
                                            quantity={inventory.find(i => i.cardId === card.id)?.quantity || 0}
                                            collectionGoal={collectionGoal}
                                            isSelected={selectedCardIds.has(card.id)}
                                            isMultiSelectMode={isMultiSelectMode}
                                            onLongPress={() => handleLongPress(card.id)}
                                            onSelect={() => toggleCardSelection(card.id)}
                                            onClick={() => setSelectedCard(card)} 
                                          />
                                       ))}
                                     </div>
                                   );
                                 }

                                 return (
                                   <div key={item.id} className="relative bg-[#1E1E1E] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                                     {bgImage && (
                                       <img 
                                         src={bgImage}
                                         loading="lazy"
                                         decoding="async"
                                         alt=""
                                         style={{ contentVisibility: 'auto' }}
                                         className={`absolute inset-0 w-full h-full object-cover z-0 ${bgPos.replace('bg-[50%_25%]', 'object-[50%_25%]').replace('bg-center', 'object-center').replace('bg-top', 'object-top')} opacity-15 pointer-events-none`}
                                       />
                                     )}
                                     <button 
                                       disabled={item.locked}
                                       onClick={() => {
                                         if (isExpandable) {
                                           setExpandedCategories(prev => 
                                             prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                                           );
                                         } else {
                                           setFilters({...filters, expansion: item.id});
                                         }
                                       }}
                                       className={`relative z-10 w-full p-5 flex items-center justify-between transition-all ${item.locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}
                                     >
                                       <div className="flex flex-col items-start flex-1 mr-4">
                                         <div className="flex items-center gap-2">
                                           <span className="text-xs font-black text-white uppercase tracking-tight italic text-left">{item.label}</span>
                                           {item.locked && <span className="text-[7px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">SOON</span>}
                                         </div>
                                       </div>
                                       
                                       <div className="flex items-center gap-4">
                                         {!item.locked && (
                                            <div className="text-right">
                                              <p className="text-[11px] font-black text-gray-400">{progress}%</p>
                                              <div className="w-16 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
                                              </div>
                                            </div>
                                         )}
                                         {isExpandable ? (
                                           <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                             <ChevronDown size={22} className="text-gray-600" />
                                           </motion.div>
                                         ) : (
                                           !item.locked && <ChevronRight size={22} className="text-gray-700 hover:text-orange-500" />
                                         )}
                                       </div>
                                     </button>

                                     <AnimatePresence>
                                       {isExpandable && isExpanded && (
                                         <motion.div
                                           initial={{ height: 0, opacity: 0 }}
                                           animate={{ height: 'auto', opacity: 1 }}
                                           exit={{ height: 0, opacity: 0 }}
                                           className="bg-black/20 border-t border-white/5 p-3 space-y-1"
                                         >
                                           {(item.subItems || []).map(sub => (
                                             <button
                                               key={sub.id}
                                               onClick={() => setFilters({...filters, expansion: sub.id})}
                                               className="w-full p-4 rounded-2xl hover:bg-orange-500/10 transition-all flex items-center justify-between group"
                                             >
                                               <span className="text-sm font-black text-gray-300 group-hover:text-orange-500 transition-colors uppercase italic">{sub.label}</span>
                                               <ChevronRight size={16} className="text-gray-700 group-hover:text-orange-500" />
                                             </button>
                                           ))}
                                         </motion.div>
                                       )}
                                    </AnimatePresence>
                                   </div>
                                 );
                               })}
                            </div>
                          );
                        })()}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1E1E1E] p-4 rounded-2xl border border-white/5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                      <Layers size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{t.currentSet}</p>
                      <h3 className="font-black text-sm text-white leading-tight uppercase italic">{getExpansionName(filters.expansion)}</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className={`px-3 py-2 rounded-full border transition-all flex items-center gap-2 ${showAlternatives ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-orange-500/10 hover:text-orange-500'}`}
                      title={t.showAlternatives}
                    >
                      <Zap size={18} />
                      <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">{t.alternatives}</span>
                    </button>
                    <button 
                      onClick={() => setIsExpansionSheetOpen(true)}
                      className="p-2.5 bg-white/5 text-gray-500 rounded-full border border-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                      title={t.changeCollection}
                    >
                      <Plus size={20} />
                    </button>
                    <button 
                      onClick={() => setIsFilterSheetOpen(true)}
                      className="p-2.5 bg-white/5 text-gray-500 rounded-full border border-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                      title={t.filters}
                    >
                      <Filter size={20} />
                    </button>
                  </div>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3" : "flex flex-col gap-2"}>
                  {filteredCards.map((card, idx) => (
                    viewMode === 'grid' ? (
                      <CardItem 
                        key={`${card.id}-${card.expansion}-${idx}`} 
                        card={card} 
                        quantity={inventory.find(i => i.cardId === card.id)?.quantity || 0}
                        collectionGoal={collectionGoal}
                        isSelected={selectedCardIds.has(card.id)}
                        isMultiSelectMode={isMultiSelectMode}
                        onLongPress={() => handleLongPress(card.id)}
                        onSelect={() => toggleCardSelection(card.id)}
                        onClick={() => setSelectedCard(card)} 
                      />
                    ) : (
                      <CardListItem
                        key={`${card.id}-${card.expansion}-${idx}`}
                        card={card}
                        quantity={inventory.find(i => i.cardId === card.id)?.quantity || 0}
                        collectionGoal={collectionGoal}
                        lang={lang}
                        isSelected={selectedCardIds.has(card.id)}
                        isMultiSelectMode={isMultiSelectMode}
                        onLongPress={() => handleLongPress(card.id)}
                        onSelect={() => toggleCardSelection(card.id)}
                        onClick={() => setSelectedCard(card)}
                      />
                    )
                  ))}
                </div>

                {filteredCards.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-bold">{t.noCardsFound}</p>
                    <button 
                      onClick={() => {
                        setFilters({ rarities: [], colors: [], expansion: filters.expansion, types: [], legalStatus: [], alternatives: DEFAULT_ALTERNATIVES, owned: 'all' });
                        setSearchQuery('');
                      }}
                      className="mt-4 text-cyan-500 text-sm font-bold underline"
                    >
                      {t.clearFilters}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1E1E1E] border border-white/10 rounded-2xl px-12 py-4 text-base text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-500"
                />
                <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={22} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsExpansionSheetOpen(true)}
                className="p-4 bg-white/5 text-gray-500 rounded-2xl border border-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                title={t.changeCollection}
              >
                <Plus size={22} />
              </button>
              <button 
                onClick={() => setIsFilterSheetOpen(true)}
                className="p-4 bg-white/5 text-gray-500 rounded-2xl border border-white/5 hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                title={t.filters}
              >
                <Filter size={22} />
              </button>
            </div>

            {searchQuery.length < 2 && !hasActiveFilters ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 opacity-70">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-50" />
                  <Search size={40} className="text-cyan-500 relative z-10" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">Empieza a buscar</h3>
                <p className="text-gray-400 text-sm max-w-[280px] mb-8 leading-relaxed">
                  Busca por <strong className="text-white">Nombre</strong> o <strong className="text-white">Código</strong> (ej. FB01-001).
                  Usa el botón de filtros arriba a la derecha para un control más avanzado.
                </p>
                <div className="flex items-center gap-4 w-full max-w-[280px]">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">o prueba con</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                   <button onClick={() => setSearchQuery('Son Goku')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 transition-all">Son Goku</button>
                   <button onClick={() => setSearchQuery('Vegeta')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 transition-all">Vegeta</button>
                   <button onClick={() => setSearchQuery('Secret Rare')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/50 transition-all">Secret Rare</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    {globalSearchResults.length} RESULTADOS
                  </h3>
                </div>

                {globalSearchResults.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pb-8">
                    {globalSearchResults.map((card, idx) => (
                      <CardItem 
                        key={`${card.id}-${card.expansion}-${idx}`} 
                        card={card} 
                        quantity={inventory.find(i => i.cardId === card.id)?.quantity || 0}
                        collectionGoal={collectionGoal}
                        isSelected={selectedCardIds.has(card.id)}
                        isMultiSelectMode={isMultiSelectMode}
                        onLongPress={() => handleLongPress(card.id)}
                        onSelect={() => toggleCardSelection(card.id)}
                        onClick={() => setSelectedCard(card)} 
                      />
                    ))}
                  </div>

                ) : (
                  <div className="text-center py-20">
                    <p className="text-gray-500 font-bold">{t.noCardsFound}</p>
                    <button 
                      onClick={() => {
                        setFilters({ rarities: [], colors: [], expansion: filters.expansion, types: [], legalStatus: [], alternatives: DEFAULT_ALTERNATIVES, owned: 'all' });
                        setSearchQuery('');
                      }}
                      className="mt-4 text-cyan-500 text-sm font-bold underline"
                    >
                      {t.clearFilters}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-24"
          >
            <CardStats 
              cards={cards} 
              inventory={inventory} 
              collectionGoal={collectionGoal} 
              lang={lang} 
              achievementsList={achievementsList}
              userAchievements={userAchievements}
              gameType={gameType}
              isInventoryLoading={isInventoryLoading}
            />
          </motion.div>
        )}


        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto space-y-8">
            {profileView === 'main' ? (
              <>
                <div className="flex flex-col items-center py-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500 db-glow-orange mb-4 bg-white/5 flex items-center justify-center">
                    <img 
                      src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`;
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-black text-white">{profile?.displayName}</h2>
                  <p className="text-gray-500 text-sm mb-8">{profile?.email}</p>
                </div>

                <div className="space-y-3">
                  {/* Achievements link */}
                  <button 
                    onClick={() => setProfileView('achievements')}
                    className="w-full p-5 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors border border-white/5 text-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 rounded-lg text-orange-500"><Trophy size={20} /></div>
                      <span className="font-bold">{t.achievements}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">
                        {userAchievements.length}/{achievementsList.length}
                      </span>
                      <ChevronRight size={20} className="text-gray-600" />
                    </div>
                  </button>

                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="p-2 bg-white/5 rounded-lg"><Settings size={20} /></div>
                      <span className="font-bold">{t.modeLabel}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
                      <button 
                        onClick={() => {
                          setCollectionGoal('collector');
                          if (user) updateProfileFields({ collectionGoal: 'collector' });
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${collectionGoal === 'collector' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Library size={14} />
                        {t.collector}
                      </button>
                      <button 
                        onClick={() => {
                          setCollectionGoal('player');
                          if (user) updateProfileFields({ collectionGoal: 'player' });
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${collectionGoal === 'player' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Sword size={14} />
                        {t.player}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight italic">
                      {collectionGoal === 'collector' ? t.collectorDesc : t.playerDesc}
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="p-2 bg-white/5 rounded-lg"><Globe size={20} /></div>
                      <span className="font-bold">{t.language}</span>
                    </div>
                    
                   <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
                      <button 
                        onClick={() => {
                          setLang('es');
                          if (user) updateProfileFields({ language: 'es' });
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${lang === 'es' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        Español
                      </button>
                      <button 
                        onClick={() => {
                          setLang('en');
                          if (user) updateProfileFields({ language: 'en' });
                        }}
                        className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${lang === 'en' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full p-5 bg-orange-500/10 rounded-2xl flex items-center justify-between hover:bg-orange-500/20 transition-colors border border-orange-500/20 text-orange-400"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-500/10 rounded-lg"><MessageSquare size={20} /></div>
                      <span className="font-bold">{t.sendFeedback}</span>
                    </div>
                    <ChevronRight size={20} className="text-orange-900" />
                  </button>

                  {/* Changelog Button */}
                  <button 
                    onClick={() => setIsChangelogModalOpen(true)}
                    className="w-full p-5 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors border border-white/5 text-gray-400"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 rounded-lg text-blue-500"><Library size={20} /></div>
                      <div className="text-left">
                        <span className="font-bold block text-white">{t.changelog}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase">{t.viewLatestChanges}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>

                  {user?.email === 'anulix1983@gmail.com' && totalUsersCount !== null && (
                    <div className="p-5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-400">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <Users size={20} />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-yellow-500/60 font-bold uppercase block leading-none mb-1">ADMIN: Usuarios Totales</span>
                          <span className="text-2xl font-black italic">{totalUsersCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <a 
                    href="https://ko-fi.com/pabloanulix" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full p-5 bg-pink-500/10 rounded-2xl flex items-center justify-between hover:bg-pink-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-pink-500/30 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)] overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-xl shadow-lg border border-pink-400/50">
                        <Coffee size={24} className="animate-[wiggle_2s_ease-in-out_infinite]" />
                      </div>
                      <div className="text-left">
                        <span className="font-black text-lg block">{t.donateTitle}</span>
                        <span className="text-xs text-pink-400/80 font-medium">{t.donateDesc}</span>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-pink-400 opacity-50 group-hover:opacity-100 transition-opacity relative z-10" />
                  </a>

                  <button 
                    onClick={handleLogout}
                    className="w-full p-5 bg-red-500/10 rounded-2xl flex items-center justify-between hover:bg-red-500/20 transition-colors border border-red-500/20 text-red-400"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/10 rounded-lg"><LogOut size={20} /></div>
                      <span className="font-bold">{t.logout}</span>
                    </div>
                  </button>

                </div>
              </>
            ) : (
              <AchievementsView 
                cards={cards}
                inventory={inventory}
                userAchievements={userAchievements}
                lang={lang}
                groups={currentGroups}
                onBack={() => setProfileView('main')}
              />
            )}

            <div className="pt-8 pb-12 text-center flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">DBS Tracker v{APP_VERSION}</p>
              </div>
              <p className="text-[8px] font-bold text-gray-800 uppercase">Actualizado hoy</p>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Goal Selector */}
      <AnimatePresence>
        {!hasSetGoal && user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1E1E1E] p-8 rounded-2xl border border-white/5 shadow-2xl max-w-sm w-full space-y-6"
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <Star size={32} className="text-orange-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t.welcome}</h2>
                <p className="text-gray-400 text-sm">{t.onboardingSub}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => {
                    setCollectionGoal('collector');
                    setHasSetGoal(true);
                    if (user) updateProfileFields({ collectionGoal: 'collector', hasSetGoal: true });
                  }}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500/10 hover:border-orange-500/30 group transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-orange-500/20"><Library size={20} className="text-gray-400 group-hover:text-orange-400" /></div>
                    <span className="font-black text-white uppercase tracking-tight">{t.collector}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 group-hover:text-gray-400">{t.collectorDesc}</p>
                </button>

                <button 
                  onClick={() => {
                    setCollectionGoal('player');
                    setHasSetGoal(true);
                    if (user) updateProfileFields({ collectionGoal: 'player', hasSetGoal: true });
                  }}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500/10 hover:border-orange-500/30 group transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-orange-500/20"><Sword size={20} className="text-gray-400 group-hover:text-orange-400" /></div>
                    <span className="font-black text-white uppercase tracking-tight">{t.player}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 group-hover:text-gray-400">{t.playerDesc}</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence mode="wait">
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] overflow-y-auto"
          >
            <div className="min-h-screen flex items-center justify-center p-6 relative">
              {/* Stop propagation on backdrop click to allow closing when clicking outer areas if needed */}
              
              {/* Top Controls - Fixed to Viewport */}
              <div className="fixed top-6 left-6 right-6 flex items-center justify-between z-[120] pointer-events-none">
                {/* Top Left: Details */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className={`pointer-events-auto p-4 rounded-full backdrop-blur-xl transition-all border border-white/10 ${showDetails ? 'bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'}`}
                >
                  <Info size={20} />
                </button>

                {/* Center: Legal Status Badge */}
                {!showDetails && selectedCard.legalStatus && (
                  <div 
                    className={`pointer-events-auto px-4 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2 ${
                      selectedCard.legalStatus === 'Banned' ? 'bg-red-500/80 text-white' :
                      selectedCard.legalStatus === 'Banned (BO1)' ? 'bg-orange-600/80 text-white' :
                      selectedCard.legalStatus === 'Limited' ? 'bg-blue-500/80 text-white' :
                      'bg-yellow-400/90 text-black'
                    }`}
                  >
                    <Shield size={14} className={selectedCard.legalStatus === 'Errata' ? 'text-black' : 'text-white'} />
                    <span>
                      {selectedCard.legalStatus === 'Banned' ? t.banned : 
                       selectedCard.legalStatus === 'Banned (BO1)' ? t.bannedBO1 :
                       selectedCard.legalStatus === 'Limited' ? (gameType === 'fusion' ? (lang === 'es' ? 'Restringida' : 'Restricted') : t.limited) : t.errata}
                    </span>
                  </div>
                )}

                {/* Top Right: Flip & Close */}
                <div className="flex gap-3 pointer-events-auto">
                  {selectedCard.type === 'Leader' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(!isFlipped);
                      }}
                      className="p-4 bg-white/10 hover:bg-orange-500/40 text-white rounded-full backdrop-blur-xl transition-all border border-white/10"
                    >
                      <RefreshCw size={20} className={isFlipped ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedCard(null);
                      setShowDetails(false);
                      setIsFlipped(false);
                    }}
                    className="p-4 bg-white/10 hover:bg-red-500/40 text-white rounded-full backdrop-blur-xl transition-all border border-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Legal Status Badge */}{/* Desktop Navigation Arrows - Positioned relative to the scroll container or screen */}
              <div className="hidden md:flex fixed inset-x-0 top-1/2 -translate-y-1/2 px-12 justify-between pointer-events-none z-[110]">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevCard();
                  }}
                  className="p-4 bg-white/10 rounded-full hover:bg-orange-500 hover:text-white transition-all text-gray-400 pointer-events-auto shadow-2xl backdrop-blur-md border border-white/5"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextCard();
                  }}
                  className="p-4 bg-white/10 rounded-full hover:bg-orange-500 hover:text-white transition-all text-gray-400 pointer-events-auto shadow-2xl backdrop-blur-md border border-white/5"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="w-full max-w-md px-4 mx-auto relative pt-24 pb-12">
                <motion.div 
                  key={selectedCard.id}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    const vel = velocity.x;
                    if (swipe < -100 || vel < -500) {
                      handleNextCard();
                    } else if (swipe > 100 || vel > 500) {
                      handlePrevCard();
                    }
                  }}
                  className="flex flex-col items-center gap-6 cursor-grab active:cursor-grabbing"
                >
                <AnimatePresence mode="wait">
                  {!showDetails ? (
                    <motion.div 
                      key="full-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`w-full ${selectedCard.type === 'Playmat' ? 'max-w-[460px] md:max-w-[600px] mt-12' : 'max-w-[260px]'} mx-auto`}
                    >
                      <ModalCard selectedCard={selectedCard} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="details-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`w-full ${selectedCard.type === 'Playmat' ? 'max-w-xl' : 'max-w-sm'} mx-auto`}
                    >
                      <div className="bg-black/50 p-5 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col gap-5 text-left">
                        <div className={`flex gap-4 ${selectedCard.type === 'Playmat' ? 'flex-col items-center' : ''}`}>
                          <div className={`${selectedCard.type === 'Playmat' ? 'w-full max-w-[400px]' : 'w-24 shrink-0'} shadow-xl rounded-xl`}>
                            <ModalCard selectedCard={selectedCard} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h2 className="text-base font-black tracking-tight text-white leading-tight mb-1">{selectedCard.name}</h2>
                            <p className="text-[11px] text-cyan-400 font-bold mb-3">
                              {selectedCard.cardNumber} • {selectedCard.rarity.replace(/\*/g, '★')} • {(() => {
                                const expId = selectedCard.expansion;
                                for (const g of currentGroups) {
                                  for (const i of g.items) {
                                    if (i.id === expId) return typeof i.label === 'string' ? i.label : (i.label as any)[lang] || (i.label as any).en || i.label;
                                    if (i.subItems) {
                                      const s = i.subItems.find(sub => sub.id === expId);
                                      if (s) return typeof s.label === 'string' ? s.label : (s.label as any)[lang] || (s.label as any).en || s.label;
                                    }
                                  }
                                }
                                return expId;
                              })()}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-0.5">{t.color}</p>
                                <p className="font-bold text-white text-xs">
                                  {(t as any).colorNames?.[selectedCard.color] || selectedCard.color}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-0.5">{t.type}</p>
                                <p className="font-bold text-white text-xs">
                                  {(t as any).typeNames?.[selectedCard.id.includes('_SLR') ? 'Leader Rare' : selectedCard.type] || (selectedCard.id.includes('_SLR') ? 'Leader Rare' : selectedCard.type)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedCard.description && (
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1.5 leading-none">Descripción</p>
                            <p className="text-[11px] text-gray-300 font-medium leading-relaxed italic">
                              "{selectedCard.description}"
                            </p>
                          </div>
                        )}

                        {['P-593_PR', 'P-597_PR'].includes(selectedCard.id) && (
                          <button
                            onClick={() => {
                              setSearchQuery('Deluxe Pack 2024 Vol.1');
                              setActiveTab('search');
                              setSelectedCard(null);
                              setShowDetails(false);
                              setFilters({
                                rarities: [],
                                colors: [],
                                expansion: 'Todos',
                                types: [],
                                legalStatus: [],
                                alternatives: DEFAULT_ALTERNATIVES,
                                owned: 'all'
                              });
                              window.scrollTo(0, 0);
                            }}
                            className="w-full p-3.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-2xl transition-all flex items-center justify-between group/deluxe shadow-lg"
                          >
                            <div className="text-left">
                              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Deluxe Pack 2024 Vol.1</p>
                              <p className="font-black text-xs text-orange-500 uppercase italic">Ver pack completo</p>
                            </div>
                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover/deluxe:bg-orange-500/20 group-hover/deluxe:scale-110 transition-all">
                              <Package size={18} />
                            </div>
                          </button>
                        )}

                        {selectedCard.legalStatus && (
                          <div className={`p-3.5 rounded-2xl border ${
                            selectedCard.legalStatus === 'Banned' ? 'bg-red-500/10 border-red-500/20' :
                            selectedCard.legalStatus === 'Banned (BO1)' ? 'bg-orange-500/10 border-orange-500/20' :
                            selectedCard.legalStatus === 'Limited' ? 'bg-blue-500/10 border-blue-500/20' :
                            'bg-yellow-400/10 border-yellow-400/20'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Shield size={12} className={
                                selectedCard.legalStatus === 'Banned' ? 'text-red-500' :
                                selectedCard.legalStatus === 'Banned (BO1)' ? 'text-orange-500' :
                                selectedCard.legalStatus === 'Limited' ? 'text-blue-500' :
                                'text-yellow-400'
                              } />
                              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none">{t.legalStatusLabel}</p>
                            </div>
                            <p className={`font-black text-xs ${
                              selectedCard.legalStatus === 'Banned' ? 'text-red-500' :
                              selectedCard.legalStatus === 'Banned (BO1)' ? 'text-orange-500' :
                              selectedCard.legalStatus === 'Limited' ? 'text-blue-500' :
                              'text-yellow-400'
                            }`}>
                              {selectedCard.legalStatus === 'Banned' ? t.banned : 
                               selectedCard.legalStatus === 'Banned (BO1)' ? t.bannedBO1 :
                               selectedCard.legalStatus === 'Limited' ? (gameType === 'fusion' ? (lang === 'es' ? 'Restringida' : 'Restricted') : t.limited) : t.errata}
                              {selectedCard.legalDate && (
                                <span className="ml-1.5 text-gray-400 font-bold normal-case">
                                  ({selectedCard.legalDate})
                                </span>
                              )}
                            </p>
                            
                            {/* Errata Links inside details view */}
                            {selectedCard.legalStatus === 'Errata' ? (
                              <a 
                                href="https://www.dbs-cardgame.com/asia/rule/errata-cards.php" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-between w-full p-2.5 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/30 rounded-xl transition-all group"
                              >
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tight">{t.viewOfficialErrata}</span>
                                <ExternalLink size={14} className="text-yellow-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </a>
                            ) : (selectedCard.legalStatus === 'Banned' || selectedCard.legalStatus === 'Limited' || selectedCard.legalStatus === 'Banned (BO1)') && (
                              <a 
                                href="https://www.dbs-cardgame.com/europe-en/rule/banned-limited-cards.php" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`mt-3 flex items-center justify-between w-full p-2.5 border rounded-xl transition-all group ${
                                  selectedCard.legalStatus === 'Banned' ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' :
                                  selectedCard.legalStatus === 'Banned (BO1)' ? 'bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30' :
                                  'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30'
                                }`}
                              >
                                <span className={`text-[10px] font-black uppercase tracking-tight ${
                                  selectedCard.legalStatus === 'Banned' ? 'text-red-500' :
                                  selectedCard.legalStatus === 'Banned (BO1)' ? 'text-orange-500' :
                                  'text-blue-500'
                                }`}>{t.viewOfficialBannedList}</span>
                                <ExternalLink size={14} className={`group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${
                                  selectedCard.legalStatus === 'Banned' ? 'text-red-500' :
                                  selectedCard.legalStatus === 'Banned (BO1)' ? 'text-orange-500' :
                                  'text-blue-500'
                                }`} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Always visible quantity controls */}
                <div className="flex flex-col gap-4 w-full max-w-[280px] mx-auto">
                  <div className="bg-white/5 backdrop-blur-xl shrink-0 rounded-full flex items-center justify-between p-1.5 border border-white/10 w-full shadow-2xl relative z-10">
                    <button 
                      onClick={() => handleUpdateQuantity(selectedCard.id, -1)}
                      className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.quantity}</span>
                      <span className="text-2xl font-black text-white tabular-nums">
                        {inventory.find(i => i.cardId === selectedCard.id)?.quantity || 0}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleUpdateQuantity(selectedCard.id, 1)}
                      className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {selectedCard.sourceProduct && (() => {
                    const findSetIdBySourceProduct = (sourceProduct: string, cardId: string): string | null => {
                      const lowerSource = sourceProduct.toLowerCase();
                      
                      const setEntry = Object.entries(SET_METADATA).find(([, meta]) => 
                        meta.sourceProduct.toLowerCase() === lowerSource
                      );
                      if (setEntry) {
                        const baseId = setEntry[0];
                        for (const group of currentGroups) {
                          for (const item of group.items) {
                            if (item.id === `${baseId}_FOLDER` || item.id === baseId) {
                              if (item.subItems) {
                                let expectedMatch = null;
                                if (cardId.includes('_W') || cardId.includes('_WINNER')) {
                                  expectedMatch = item.subItems.find(s => s.label.toLowerCase().includes('winner'));
                                } else if (cardId.includes('_A') || cardId.includes('_ALT')) {
                                  expectedMatch = item.subItems.find(s => s.label.toLowerCase().includes('alt'));
                                }
                                if (!expectedMatch) {
                                  expectedMatch = item.subItems.find(s => s.label.toLowerCase().includes('normal'));
                                }
                                if (expectedMatch) return expectedMatch.id;
                              }
                              return item.id;
                            }
                            if (item.subItems) {
                              const directMatch = item.subItems.find(s => s.id === baseId || s.id === `${baseId}_FOLDER`);
                              if (directMatch) return directMatch.id;
                            }
                          }
                        }
                        return baseId;
                      }
                    
                      for (const group of currentGroups) {
                        for (const item of group.items) {
                          let labelMatch = false;
                          if (typeof item.label === 'string') {
                            labelMatch = item.label.toLowerCase() === lowerSource || item.label.toLowerCase().includes(lowerSource);
                          } else {
                            labelMatch = Object.values(item.label).some(l => 
                              (l as string).toLowerCase() === lowerSource || (l as string).toLowerCase().includes(lowerSource)
                            );
                          }

                          if (labelMatch) {
                            if (item.locked) return null;
                            if (item.subItems) {
                              const isWinner = cardId.includes('_W') || cardId.includes('_WINNER');
                              const isAlt = cardId.includes('_A') || cardId.includes('_ALT');
                              const sub = item.subItems.find(s => {
                                if (isWinner) return s.label.toLowerCase().includes('winner');
                                if (isAlt) return s.label.toLowerCase().includes('alt');
                                return s.label.toLowerCase().includes('normal');
                              });
                              if (sub) return sub.id;
                            }
                            return item.id;
                          }
                        }
                      }
                      return null;
                    };
                    
                    const targetSetId = findSetIdBySourceProduct(selectedCard.sourceProduct, selectedCard.id);
                    const isSpecial = getCardTags(selectedCard).some(t => ['winner', 'tournament', 'anniversary', 'playmat', 'championship', 'sleeve', 'ultimate-battle'].includes(t)) || selectedCard.id.includes('_PR') || selectedCard.id.includes('_RE_');

                    return (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            if (targetSetId) {
                              let parentCategoryId = '';
                              let parentLabel = '';
                              for (const group of currentGroups) {
                                for (const item of group.items) {
                                  if (item.id === targetSetId) {
                                    parentCategoryId = group.category;
                                    parentLabel = item.label;
                                    break;
                                  } else if (item.subItems?.find(sub => sub.id === targetSetId)) {
                                    parentCategoryId = group.category;
                                    parentLabel = item.label;
                                    break;
                                  }
                                }
                                if (parentCategoryId) break;
                              }

                              const targetCategory = FUSION_CATEGORIES.find(c => c.categories.includes(parentCategoryId));
                              
                              if (targetCategory) {
                                setActiveTab('fusion-world');
                                setCurrentCollectionCategory(targetCategory.id);
                                if (['Coleccionismo', 'Store Events', 'Championship'].includes(parentCategoryId)) {
                                  setCurrentCollectionSubCategory(parentLabel);
                                  if (!targetSetId.includes('_FOLDER')) {
                                    setTimeout(() => setFilters({...filters, expansion: targetSetId}), 50);
                                  } else {
                                    setTimeout(() => setFilters({...filters, expansion: 'Todos'}), 50);
                                  }
                                } else {
                                  setCurrentCollectionSubCategory(parentLabel);
                                  setTimeout(() => setFilters({...filters, expansion: targetSetId}), 50);
                                }
                                setSearchQuery('');
                                setSelectedCard(null);
                                window.scrollTo(0, 0);
                              } else {
                                setSearchQuery(selectedCard.sourceProduct);
                                handleTabChange('search');
                                setSelectedCard(null);
                                window.scrollTo(0, 0);
                              }
                            }
                          }}
                          className={`w-full bg-black/40 backdrop-blur-xl p-3 px-4 rounded-2xl border-2 transition-all group/set shadow-xl flex items-center justify-between ${targetSetId ? 'hover:bg-orange-500/10 border-orange-500/30' : 'border-white/5 cursor-default opacity-80'}`}
                        >
                          <div className="text-left">
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] mb-0.5 leading-none">
                              {isSpecial ? 'INFO ORIGEN' : 'SET COLECCIÓN'}
                            </p>
                            <p className={`font-black text-[11px] uppercase italic tracking-tight leading-none ${targetSetId ? 'text-orange-500 group-hover/set:text-orange-400' : 'text-white/80'}`}>
                              {selectedCard.sourceProduct}
                            </p>
                          </div>
                          {targetSetId && (
                            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover/set:bg-orange-500/20 group-hover/set:scale-110 transition-all border border-orange-500/20">
                              <ChevronRight size={14} />
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      <AnimatePresence>
        {isExpansionSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpansionSheetOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-[32px] z-[80] p-8 pb-12 shadow-2xl max-w-md mx-auto sm:max-w-none h-[80vh] overflow-y-auto border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sticky top-0" />
              <h3 className="text-xl font-black mb-6 text-white">{t.collection}</h3>
              
              <div className="space-y-8">
                <button 
                  onClick={() => {
                    setFilters({...filters, expansion: 'Todos', types: [], colors: []});
                    setIsExpansionSheetOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${filters.expansion === 'Todos' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/5'}`}
                >
                  <div>
                    <p className={`font-black text-sm ${filters.expansion === 'Todos' ? 'text-orange-500' : 'text-white'}`}>{t.allCollections}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{t.seeAll}</p>
                  </div>
                  {filters.expansion === 'Todos' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </button>

                {currentGroups.map((group) => (
                  <div key={group.category} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{group.category}</h4>
                      {group.category === 'Coleccionismo' && (
                        <span className="text-[7px] bg-white/5 text-gray-600 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter border border-white/5">PRÓXIMAMENTE</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {group.items.map((set) => (
                        <button 
                          key={set.id}
                          disabled={set.locked}
                          onClick={() => {
                            setFilters({...filters, expansion: set.id});
                            setIsExpansionSheetOpen(false);
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${set.locked ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5' : (filters.expansion === set.id ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10')}`}
                        >
                          <div className="text-left flex-1 mr-4">
                            <div className="flex items-center gap-2">

                              <p className={`font-black text-sm text-left ${filters.expansion === set.id ? 'text-orange-500' : 'text-white'}`}>{set.label}</p>
                              {set.locked && (
                                <span className="text-[8px] bg-black/40 text-gray-500 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter border border-white/5">PRÓXIMAMENTE</span>
                              )}
                            </div>
                          </div>
                          {filters.expansion === set.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                          {set.locked && <Lock size={14} className="text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-[32px] z-[80] p-8 pb-12 shadow-2xl max-w-md mx-auto sm:max-w-none max-h-[85vh] overflow-y-auto border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sticky top-0 bg-[#1E1E1E]" />
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1E1E1E] z-10 py-2">
                <h3 className="text-xl font-black text-white">{t.filters}</h3>
                <button 
                  onClick={() => setFilters({ rarities: [], colors: [], expansion: filters.expansion, types: [], legalStatus: [], alternatives: DEFAULT_ALTERNATIVES, owned: 'all' })}
                  className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 active:scale-95 transition-transform"
                >
                  {lang === 'es' ? 'LIMPIAR TODO' : 'CLEAR ALL'}
                </button>
              </div>
              
              <div className="space-y-6">
                {(activeTab !== 'search' || searchQuery.length > 0 || filters.rarities.length > 0 || filters.colors.length > 0 || filters.expansion !== 'Todos' || filters.types.length > 0 || filters.legalStatus.length > 0 || filters.owned !== 'all') && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.ownedFilter}</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: t.allCards },
                        { id: 'owned', label: t.onlyOwned },
                        { id: 'not-owned', label: t.onlyNotOwned }
                      ].map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setFilters({...filters, owned: opt.id as any})}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filters.owned === opt.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableOptions.colors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.color}</p>
                      <button 
                        onClick={() => setFilters({...filters, colors: []})}
                        className="text-[10px] font-black text-orange-500 uppercase hover:underline"
                      >
                        {t.allCollections === 'Todas' || lang === 'es' ? 'LIMPIAR' : 'CLEAR'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableOptions.colors.map(c => {
                        const isSelected = filters.colors.includes(c);
                        return (
                          <button 
                            key={c}
                            onClick={() => {
                              const newColors = isSelected 
                                ? filters.colors.filter(x => x !== c)
                                : [...filters.colors, c];
                              setFilters({...filters, colors: newColors});
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                          >
                            {(t as any).colorNames?.[c] || c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.raritiesFound.split(' ')[0]}</p>
                    <button 
                      onClick={() => setFilters({...filters, rarities: []})}
                      className="text-[10px] font-black text-orange-500 uppercase hover:underline"
                    >
                      {t.allCollections === 'Todas' || lang === 'es' ? 'LIMPIAR' : 'CLEAR'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {availableOptions.rarities.map(r => {
                      const isSelected = filters.rarities.includes(r);
                      return (
                      <button 
                        key={r}
                        onClick={() => {
                          const newRarities = isSelected 
                            ? filters.rarities.filter(x => x !== r)
                            : [...filters.rarities, r];
                          setFilters({...filters, rarities: newRarities});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                      >
                        {r.replace(/\*/g, '★')}
                      </button>
                    )})}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.distributionByType.split(' ').pop()}</p>
                    <button 
                      onClick={() => setFilters({...filters, types: []})}
                      className="text-[10px] font-black text-orange-500 uppercase hover:underline"
                    >
                      {t.allCollections === 'Todas' || lang === 'es' ? 'LIMPIAR' : 'CLEAR'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.types.map(typeVal => {
                      const isSelected = filters.types.includes(typeVal);
                      return (
                        <button 
                          key={typeVal}
                          onClick={() => {
                            const newTypes = isSelected 
                              ? filters.types.filter(x => x !== typeVal)
                              : [...filters.types, typeVal];
                            setFilters({...filters, types: newTypes});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                        >
                          {(t as any).typeNames?.[typeVal] || typeVal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.alternatives}</p>
                    <button 
                      onClick={() => setFilters({...filters, alternatives: DEFAULT_ALTERNATIVES})}
                      className="text-[10px] font-black text-orange-500 uppercase hover:underline"
                    >
                      {lang === 'es' ? 'TODAS' : 'ALL'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(gameType === 'fusion' ? [
                      { id: 'tournament', label: 'Tournament Packs' },
                      { id: 'championship', label: 'Championship' },
                      { id: 'ultimate-battle', label: 'Ultimate Battle' },
                      { id: 'serial', label: 'Serial Cards' },
                      { id: 'event', label: 'Event Packs' },
                    ] : [
                      { id: 'event', label: 'Event Packs' },
                      { id: 'tournament', label: 'Tournament Packs' },
                      { id: 'judge', label: 'Judge Packs' },
                      { id: 'giant', label: 'Giant Size' }
                    ]).map(alt => {
                      const isSelected = filters.alternatives.includes(alt.id);
                      return (
                        <button 
                          key={alt.id}
                          onClick={() => {
                            const newAlts = isSelected 
                              ? filters.alternatives.filter(x => x !== alt.id)
                              : [...filters.alternatives, alt.id];
                            setFilters({...filters, alternatives: newAlts});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                        >
                          {alt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.legalStatusLabel}</p>
                    <button 
                      onClick={() => setFilters({...filters, legalStatus: []})}
                      className="text-[10px] font-black text-orange-500 uppercase hover:underline"
                    >
                      {t.allCollections === 'Todas' || lang === 'es' ? 'LIMPIAR' : 'CLEAR'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'banned', label: t.banned, color: 'bg-red-500' },
                      { id: 'banned (bo1)', label: t.bannedBO1, color: 'bg-orange-600' },
                      { id: 'limited', label: gameType === 'fusion' ? (lang === 'es' ? 'Restringida' : 'Restricted') : t.limited, color: 'bg-blue-500' },
                      { id: 'errata', label: t.errata, color: 'bg-yellow-400' }
                    ].filter(st => gameType !== 'fusion' ? true : (st.id === 'banned' || st.id === 'limited')).map(st => {
                      const isSelected = filters.legalStatus.includes(st.id);
                      return (
                        <button 
                          key={st.id}
                          onClick={() => {
                            const newStatus = isSelected 
                              ? filters.legalStatus.filter(x => x !== st.id)
                              : [...filters.legalStatus, st.id];
                            setFilters({...filters, legalStatus: newStatus});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${st.color}`} />
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.sortBy}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'index', label: t.collectionNumber },
                      { id: 'name', label: t.nameAZ }
                    ].map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setSortBy(s.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${sortBy === s.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/5'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl mt-4 shadow-lg db-glow-orange"
                >
                  {t.apply}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Backlog Achievement Notification Summary */}
      <AnimatePresence>
        {newAchievementsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className="bg-orange-500 p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <Trophy size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-lg leading-tight uppercase italic flex items-center gap-2">
                  ¡Bienvenido de nuevo! 
                  <Zap size={18} className="fill-white" />
                </p>
                <p className="text-white/80 text-sm font-bold mt-1">
                  Has desbloqueado <span className="text-white text-xl font-black">{newAchievementsCount}</span> nuevos logros mientras no estabas.
                </p>
                <button 
                  onClick={() => {
                    setNewAchievementsCount(0);
                    setActiveTab('profile');
                    setProfileView('achievements');
                  }}
                  className="mt-3 px-4 py-2 bg-white text-orange-600 text-[10px] font-black uppercase rounded-full shadow-lg"
                >
                  Ver todos los logros
                </button>
              </div>
              <button 
                onClick={() => setNewAchievementsCount(0)}
                className="p-2 hover:bg-black/10 rounded-full transition-colors self-start"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar activeTab={activeTab} handleTabChange={handleTabChange} lang={lang} />

      {/* Joyride Onboarding Tutorial */}
      <Joyride
        steps={tutorialSteps}
        run={false} // !hasCompletedTutorial && !authLoading && (!user || profile !== null)
        continuous={true}
        scrollToFirstStep={false}
        disableOverlayClose={true}
        disableCloseOnEsc={true}
        callback={handleJoyrideCallback}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            arrowColor: '#1E1E1E',
            backgroundColor: '#1E1E1E',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            primaryColor: '#f97316',
            textColor: '#fff',
            zIndex: 1000,
          } as any,
          tooltipContainer: {
            textAlign: 'left' as any,
          },
          buttonNext: {
            backgroundColor: '#f97316',
            borderRadius: '12px',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 900,
            padding: '10px 16px',
            border: '1px solid rgba(249, 115, 22, 0.5)',
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.3)',
          },
          buttonBack: {
            marginRight: 10,
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#9ca3af',
          },
          buttonSkip: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#ef4444',
          },
          tooltip: {
            borderRadius: '24px',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          tooltipTitle: {
            fontSize: '18px',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontStyle: 'italic',
            marginBottom: '8px',
          },
          tooltipContent: {
            fontSize: '14px',
            color: '#9ca3af', // Darker gray for description text
            lineHeight: 1.5,
          }
        }}
        locale={{
          back: lang === 'es' ? 'Atrás' : 'Back',
          close: lang === 'es' ? 'Cerrar' : 'Close',
          last: lang === 'es' ? '¡Empezar!' : 'Start!',
          next: lang === 'es' ? 'Siguiente' : 'Next',
          skip: lang === 'es' ? 'Saltar' : 'Skip',
        }}
      />

      {/* Multi-Select Action Bar */}
      <AnimatePresence>
        {isMultiSelectMode && selectedCardIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-lg"
          >
            <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-orange-500/30 p-4 rounded-3xl shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-xl">
                    <CheckCircle2 className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase italic">
                      {selectedCardIds.size} {selectedCardIds.size === 1 ? (lang === 'es' ? 'Carta' : 'Card') : (lang === 'es' ? 'Cartas' : 'Cards')}
                    </p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase">
                      {lang === 'es' ? 'Seleccionadas para actualizar' : 'Selected for update'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setIsMultiSelectMode(false);
                    setSelectedCardIds(new Set());
                  }}
                  className="p-4 hover:bg-white/5 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {collectionGoal === 'player' && (
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0 overflow-hidden">
                    <button 
                      onClick={() => setBulkQuantity(Math.max(1, bulkQuantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-12 text-center">
                      <span className="text-orange-500 font-black text-lg">{bulkQuantity}</span>
                    </div>
                    <button 
                      onClick={() => setBulkQuantity(Math.min(4, bulkQuantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={handleBulkUpdate}
                  className="flex-1 bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg db-glow-orange flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {collectionGoal === 'collector' && Array.from(selectedCardIds).every(id => {
                    const item = inventory.find(i => i.cardId === id);
                    return item && item.quantity >= 1;
                  }) 
                    ? (lang === 'es' ? 'DESMARCAR CARTAS' : 'UNMARK CARDS')
                    : (lang === 'es' ? 'ACTUALIZAR INVENTARIO' : 'UPDATE INVENTORY')
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementUnlockPopup 
            event={unlockedAchievement} 
            lang={lang} 
            onDone={handleAchievementDismiss} 
          />
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#1E1E1E] rounded-3xl p-8 z-[110] border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">{t.sendFeedback}</h3>
                <button onClick={() => setIsFeedbackModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-6 font-medium">
                ¿Has encontrado algún error? ¿Tienes sugerencias? Cuéntanos qué podemos mejorar para los testers.
              </p>

              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Escribe aquí tu comentario..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-shadow mb-6"
              />

              <button
                disabled={!feedbackMessage.trim() || isSendingFeedback}
                onClick={handleSendFeedback}
                className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg db-glow-orange disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {isSendingFeedback ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    ENVIAR COMENTARIO
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Changelog Modal (Automatic on version change or Manual) */}
      <AnimatePresence>
        {(showChangelogOnEntry || isChangelogModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1E1E1E] rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 pb-4 text-center border-b border-white/5 relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                  <Library size={32} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 font-sans">{t.changelogTitle}</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] opacity-80">{t.changelogSubtitle}</p>
                
                {(!showChangelogOnEntry && isChangelogModalOpen) && (
                   <button 
                    onClick={() => setIsChangelogModalOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-500"
                   >
                     <X size={20} />
                   </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {CHANGELOG.slice(0, showChangelogOnEntry ? 3 : 10).map((entry, idx) => (
                  <div key={entry.version} className="relative pl-8">
                    {/* Timeline Line */}
                    {(idx !== (showChangelogOnEntry ? 2 : CHANGELOG.length - 1)) && (
                      <div className="absolute left-0 top-2 bottom-[-40px] w-0.5 bg-white/5 ml-[7px]" />
                    )}
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500/20 border-4 border-[#1E1E1E] shadow-[0_0_0_2px_rgba(59,130,246,0.5)]" />
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-white italic">v{entry.version}</span>
                        <span className="text-[8px] font-black text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-sm uppercase tracking-widest">{entry.date}</span>
                      </div>
                    </div>

                    <ul className="space-y-4">
                      {entry.changes.map((change, cIdx) => (
                        <li key={cIdx} className="flex gap-3 text-sm leading-relaxed">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span className="text-gray-400 font-medium">{change[lang]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-white/5">
                <button 
                  onClick={markChangelogAsSeen}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] uppercase italic"
                >
                  {showChangelogOnEntry ? (lang === 'es' ? 'ENTENDIDO' : 'GOT IT') : t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Message Modal */}
      <AnimatePresence>
        {isCommunityModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[201] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
            onClick={closeCommunityModal}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1E1E1E] rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg flex flex-col relative my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8 pb-4 text-center border-b border-white/5 sticky top-0 bg-[#1E1E1E] z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-blue-500/30">
                  <Star size={32} className="text-blue-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight mb-2 font-sans leading-none">
                  {lang === 'es' ? 'AVISO A LA COMUNIDAD' : 'COMMUNITY NOTICE'}
                </h2>
                <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] opacity-80">
                  {lang === 'es' ? 'AVANZANDO JUNTOS' : 'MOVING FORWARD TOGETHER'}
                </p>
                <button 
                  onClick={closeCommunityModal}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <p className="text-gray-300 text-sm leading-relaxed mb-6 md:mb-8 text-center md:text-left">
                  {lang === 'es' ? (
                    <>
                      Querido jugador/coleccionista hemos completado la integración de todas las cartas que están en la base de datos de la web oficial de Dragon Ball Super Card Game Masters.
                      <br /><br />
                      Somos conscientes que todavía hay muchas versiones de ellas que no están subidas o están incorrectamente listadas. Será una tarea más para ofrecerte el mejor tracker del mundo para tu colección.
                      <br /><br />
                      Si quieres participar con tus aportaciones, puedes hacerlo a través del <strong>feedback</strong> en el perfil o escribiendo directamente en <strong>tcgdragonball@gmail.com</strong>.
                      <br /><br />
                      ¡Muchas gracias y suerte descubriendo todos los logros ocultos!
                    </>
                  ) : (
                    <>
                      Dear player/collector, we have completed the integration of all cards in the official Dragon Ball Super Card Game Masters website database.
                      <br /><br />
                      We are aware that there are still many versions that are not uploaded or are incorrectly listed. It will be another task to offer you the best tracker in the world for your collection.
                      <br /><br />
                      If you want to participate with your contributions, you can do so through <strong>feedback</strong> in the profile or by writing directly to <strong>tcgdragonball@gmail.com</strong>.
                      <br /><br />
                      Thank you very much and good luck discovering all the hidden achievements!
                    </>
                  )}
                </p>

                <button 
                  onClick={closeCommunityModal}
                  className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] uppercase italic"
                >
                  {lang === 'es' ? '¡VAMOS ALLÁ!' : 'LET\'S GO!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGameSelector && (
          <GameSelectionModal 
            lang={lang}
            onSelect={handleGameSelect}
          />
        )}
      </AnimatePresence>

    </div>
  );
}


