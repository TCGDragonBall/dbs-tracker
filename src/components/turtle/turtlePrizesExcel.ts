import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TurtleEvent, TurtleUserInfo } from './types';
import { PlayerStanding } from './standingsEngine';

interface ExportPrizesParams {
  event: TurtleEvent;
  standings: PlayerStanding[];
  usersInfo: Record<string, TurtleUserInfo>;
  lang: 'es' | 'en';
}

export async function exportTournamentPrizesExcel({
  event,
  standings,
  usersInfo,
  lang
}: ExportPrizesParams): Promise<void> {
  const isEs = lang === 'es';
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Turtle School - Dragon Ball Super Card Game';
  workbook.created = new Date();

  const sheetName = isEs ? 'Premios y Envíos' : 'Prizes & Shipping';
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  // Event info headers
  const eventTypeName = event.type === 'league' 
    ? (isEs ? 'LIGA OFICIAL' : 'OFFICIAL LEAGUE') 
    : (isEs ? 'TORNEO' : 'TOURNAMENT');
  
  const formatName = event.gameFormat === 'masters' ? 'Masters' : 'Fusion World';

  // Title Row 1
  const titleRow = sheet.addRow([
    `${event.name.toUpperCase()} - ${isEs ? 'RECOPILACIÓN DE PREMIOS Y DATOS DE ENVÍO' : 'PRIZE COLLECTION & SHIPPING DATA'}`
  ]);
  titleRow.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF15803D' } };
  sheet.mergeCells('A1:P1');
  titleRow.height = 25;

  // Subtitle Row 2
  const subRow = sheet.addRow([
    `${isEs ? 'Tipo' : 'Type'}: ${eventTypeName}  |  ${isEs ? 'Formato' : 'Format'}: ${formatName}  |  ${isEs ? 'Fecha' : 'Date'}: ${event.startDate || new Date().toISOString().split('T')[0]}  |  ${isEs ? 'Participantes' : 'Participants'}: ${standings.length}`
  ]);
  subRow.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  sheet.mergeCells('A2:P2');
  subRow.height = 18;

  // Empty separator row 3
  sheet.addRow([]);

  // Column definitions & headers (Row 4)
  const headers = isEs ? [
    'Posición',
    'Jugador (Nick)',
    'Nombre Completo (Envío)',
    'Dirección Completa de Envío',
    'Teléfono',
    'Email de Contacto',
    'Estado Datos',
    'Puntos Totales',
    'Partidas Jugadas',
    'Victorias (V)',
    'Derrotas (D)',
    'Líderes Únicos',
    'Pts Base',
    'Sanción / Ajuste',
    'Estado Torneo',
    'Observaciones de Entrega'
  ] : [
    'Rank',
    'Player (Nickname)',
    'Full Name (Shipping)',
    'Full Shipping Address',
    'Phone',
    'Contact Email',
    'Data Status',
    'Total Points',
    'Matches Played',
    'Wins (W)',
    'Losses (L)',
    'Unique Leaders',
    'Base Pts',
    'Penalty / Adjust',
    'Tournament Status',
    'Delivery Notes'
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF15803D' } // Emerald green
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // Populate data rows
  standings.forEach((p) => {
    const uInfo = usersInfo[p.userId] || { displayName: p.name, email: p.email };
    const fullName = uInfo.fullName || '';
    const address = uInfo.shippingAddress || '';
    const phone = uInfo.phone || '';
    const email = uInfo.email || p.email || '';
    const notes = uInfo.shippingNotes || (p.penaltyReason ? `Sanción: ${p.penaltyReason}` : '');

    const hasCompleteShipping = Boolean(fullName.trim() && address.trim() && phone.trim());
    const dataStatus = p.isBot
      ? (isEs ? 'BOT (Sin envío)' : 'BOT (No shipping)')
      : hasCompleteShipping
      ? (isEs ? 'COMPLETO' : 'COMPLETE')
      : (isEs ? 'PENDIENTE' : 'PENDING');

    const rankText = p.isDisqualified ? 'DQ' : `#${p.rank}`;
    const statusText = p.isDisqualified
      ? (isEs ? 'DESCALIFICADO' : 'DISQUALIFIED')
      : (isEs ? 'ACTIVO' : 'ACTIVE');

    const row = sheet.addRow([
      rankText,
      p.name,
      fullName || (isEs ? '⚠️ Sin especificar' : '⚠️ Unspecified'),
      address || (isEs ? '⚠️ Sin dirección registrada' : '⚠️ No address recorded'),
      phone || (isEs ? '⚠️ Sin teléfono' : '⚠️ No phone'),
      email || '',
      dataStatus,
      p.finalPoints,
      p.matchesPlayed,
      p.wins,
      p.losses,
      `${p.uniqueLeaderCount}/4`,
      p.rawPoints,
      p.penaltyPoints > 0 ? `-${p.penaltyPoints}` : '0',
      statusText,
      notes
    ]);

    row.height = 24;

    // Formatting cells
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Rank column centered and bold
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { bold: true, size: 11 };
        if (p.rank === 1 && !p.isDisqualified) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF08A' } }; // Gold highlight
        } else if (p.rank === 2 && !p.isDisqualified) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Silver highlight
        } else if (p.rank === 3 && !p.isDisqualified) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }; // Bronze highlight
        }
      }

      // Player Nick
      if (colNumber === 2) {
        cell.font = { bold: true };
      }

      // Full Name & Address & Notes
      if (colNumber === 3 || colNumber === 4 || colNumber === 16) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Phone & Email
      if (colNumber === 5 || colNumber === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Data Status column
      if (colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { bold: true, size: 10 };
        if (dataStatus.includes('COMPLETO') || dataStatus.includes('COMPLETE')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light green
          cell.font = { bold: true, color: { argb: 'FF166534' } };
        } else if (dataStatus.includes('PENDIENTE') || dataStatus.includes('PENDING')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light amber
          cell.font = { bold: true, color: { argb: 'FF92400E' } };
        }
      }

      // Numerical score columns centered
      if (colNumber >= 8 && colNumber <= 14) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Total points bold
      if (colNumber === 8) {
        cell.font = { bold: true, size: 11, color: { argb: 'FF15803D' } };
      }

      // Status column
      if (colNumber === 15) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (p.isDisqualified) {
          cell.font = { bold: true, color: { argb: 'FFDC2626' } };
        }
      }
    });
  });

  // Adjust Column Widths
  const colWidths = [
    10, // Posición
    22, // Jugador
    26, // Nombre Completo
    42, // Dirección
    18, // Teléfono
    26, // Email
    16, // Estado Datos
    14, // Puntos
    14, // PJ
    14, // V
    14, // D
    16, // Líderes
    12, // Pts Base
    16, // Sanción
    16, // Estado Torneo
    32  // Observaciones
  ];

  colWidths.forEach((w, idx) => {
    const col = sheet.getColumn(idx + 1);
    col.width = w;
  });

  // Clean event name for filename
  const cleanName = event.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Premios_${cleanName}_${dateStr}.xlsx`;

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, fileName);
}
