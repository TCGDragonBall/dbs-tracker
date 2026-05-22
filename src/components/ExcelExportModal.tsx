import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, AlertCircle, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Card {
  id: string;
  name: string;
  rarity: string;
  type: string;
  color: string;
  expansion: string;
  imageUrl: string;
}

interface InventoryItem {
  cardId: string;
  quantity: number;
}

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  inventory: InventoryItem[];
  collectionGoal: 'collector' | 'player';
  lang: 'es' | 'en';
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  cards,
  inventory,
  collectionGoal,
  lang
}) => {
  const [selectedGame, setSelectedGame] = useState<'fusion' | 'masters' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: lang === 'es' ? 'Exportar Faltas' : 'Export Missing Cards',
    desc: lang === 'es' ? 'Selecciona el juego del que quieres exportar tus cartas faltantes en formato Excel.' : 'Select the game to export your missing cards to Excel format.',
    fusion: 'Fusion World',
    masters: 'Masters',
    cancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    export: lang === 'es' ? 'Exportar' : 'Export',
    exporting: lang === 'es' ? 'Exportando...' : 'Exporting...',
    noMissing: lang === 'es' ? 'No tienes cartas faltantes para este juego' : 'You have no missing cards for this game',
    error: lang === 'es' ? 'Error al exportar' : 'Error exporting',
  };

  const handleExport = async () => {
    if (!selectedGame) return;
    setIsExporting(true);
    setProgress({ current: 0, total: 0 });
    setError(null);

    try {
      const filteredCards = cards.filter(c => {
        if (selectedGame === 'fusion') {
          return c.expansion.startsWith('FB') || c.expansion.startsWith('FS') || c.expansion.startsWith('FP') || c.expansion.startsWith('TP0') || c.id.includes('1ST_ANNIV') || c.id.includes('UB2') || c.id.includes('CH2') || c.id.includes('40TH') || c.expansion.includes('AS202') || c.expansion.includes('LP2') || c.expansion === 'CP_W2';
        } else {
          return !(c.expansion.startsWith('FB') || c.expansion.startsWith('FS') || c.expansion.startsWith('FP') || c.expansion.startsWith('TP0') || c.id.includes('1ST_ANNIV') || c.id.includes('UB2') || c.id.includes('CH2') || c.id.includes('40TH') || c.expansion.includes('AS202') || c.expansion.includes('LP2') || c.expansion === 'CP_W2');
        }
      });

      const limit = collectionGoal === 'collector' ? 1 : 4;
      const missingCards: { card: Card; missingQty: number }[] = [];

      for (const card of filteredCards) {
        // Find existing quantity
        const owned = inventory.find(i => i.cardId === card.id)?.quantity || 0;
        if (owned < limit) {
          missingCards.push({ card, missingQty: limit - owned });
        }
      }

      if (missingCards.length === 0) {
        setError(t.noMissing);
        setIsExporting(false);
        return;
      }

      setProgress({ current: 0, total: missingCards.length });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'DBS Tracker';
      workbook.lastModifiedBy = 'DBS Tracker';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      const sheet = workbook.addWorksheet(t.title, {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      // Define columns
      sheet.columns = [
        { header: lang === 'es' ? 'Imagen' : 'Image', key: 'imagen', width: 14 },
        { header: lang === 'es' ? 'Código' : 'Code', key: 'codigo', width: 20 },
        { header: lang === 'es' ? 'Nombre' : 'Name', key: 'nombre', width: 45 },
        { header: lang === 'es' ? 'Color' : 'Color', key: 'color', width: 15 },
        { header: 'Set', key: 'set', width: 25 },
        { header: lang === 'es' ? 'Faltan' : 'Missing', key: 'faltan', width: 12 },
      ];

      // Style header
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFf97316' } // orange-500
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      const fetchImageBase64 = async (url: string): Promise<string | null> => {
        try {
          // Usamos un proxy de imágenes optimizado que no tiene problemas de CORS y devuelve rápido
          const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&w=100&h=140&fit=contain`;
          const resp = await fetch(proxiedUrl);
          if (!resp.ok) return null;
          const blob = await resp.blob();
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return null;
        }
      };

      for (let i = 0; i < missingCards.length; i++) {
        const item = missingCards[i];
        const row = sheet.addRow({
          codigo: item.card.id,
          nombre: item.card.name,
          color: item.card.color,
          set: item.card.expansion,
          faltan: item.missingQty
        });

        // Hacemos la fila grande para que quepa la carta
        row.height = 80;
        row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        sheet.getCell(`B${row.number}`).font = { bold: true };
        sheet.getCell(`A${row.number}`).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getCell(`F${row.number}`).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getCell(`F${row.number}`).font = { bold: true, color: { argb: 'FFef4444' } };

        const imageUrl = item.card.imageUrl;
        const base64Data = await fetchImageBase64(imageUrl);

        if (base64Data) {
          try {
            const imageId = workbook.addImage({
              base64: base64Data,
              extension: 'png',
            });
            // Añadimos la imagen incrustada de forma nativa en la celda
            sheet.addImage(imageId, {
              tl: { col: 0.15, row: row.number - 1 + 0.1 },
              ext: { width: 50, height: 70 }
            });
          } catch(e) {
            // Fallback
            sheet.getCell(`A${row.number}`).value = { formula: `IMAGE("${imageUrl}")`, result: '' };
          }
        } else {
          // Si por alguna razón falla el proxy o la imagen, intentamos usar la fórmula IMAGE de Excel
          sheet.getCell(`A${row.number}`).value = { formula: `IMAGE("${imageUrl}")`, result: '' };
        }

        setProgress(prev => ({ ...prev, current: i + 1 }));
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `DBS_Faltas_${selectedGame}_${new Date().toISOString().split('T')[0]}.xlsx`);

      onClose();
      // reset
      setTimeout(() => {
        setIsExporting(false);
        setProgress({ current: 0, total: 0 });
        setSelectedGame(null);
      }, 500);

    } catch (err) {
      console.error(err);
      setError(t.error);
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#141414] border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
          >
            <button
              onClick={() => { if (!isExporting) onClose(); }}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              disabled={isExporting}
            >
              <X size={20} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <Download size={24} />
              </div>
              <h2 className="text-xl font-black text-white">{t.title}</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">{t.desc}</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                <AlertCircle size={20} />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            {!isExporting ? (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedGame('fusion')}
                  className={`w-full p-4 rounded-xl border-2 font-black transition-all ${selectedGame === 'fusion' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  {t.fusion}
                </button>
                <button
                  onClick={() => setSelectedGame('masters')}
                  className={`w-full p-4 rounded-xl border-2 font-black transition-all ${selectedGame === 'masters' ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  {t.masters}
                </button>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    {t.exporting}
                  </span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedGame || isExporting}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.export}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
