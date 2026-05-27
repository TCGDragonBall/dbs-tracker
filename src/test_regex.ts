import React from "react";

const numMap: { [key: string]: string } = {
  one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  free: '0', zero: '0'
};

const text = "[Evolve] RR[three] : ＜Champa＞";
const parts = text.split(/(\[.*?\])/g);

console.log("Parts:", parts);

parts.forEach((part, index) => {
  if (part.startsWith('[') && part.endsWith(']')) {
    const content = part.slice(1, -1);
    const lower = content.toLowerCase();
    if (numMap[lower] !== undefined || /^\d+$/.test(lower)) {
      console.log(`Part ${index} Matches number:`, numMap[lower] || lower);
    } else {
      console.log(`Part ${index} Matches badge:`, content);
    }
  } else {
    const textParts = part.split(/((?:\{[a-zA-Z0-9]+\})+\s*\d*|\b[RBYGKW]+\b|[白赤青緑黄黒紫])/g);
    console.log(`Part ${index} Text parts:`, textParts);
    textParts.forEach((tPart, j) => {
      if (!tPart) return;
      if (/^(?:\{[a-zA-Z0-9]+\})+\s*\d*$/.test(tPart)) {
        console.log(`  tPart ${j} matches curly braces:`, tPart);
      } else if (/^[RBYGKW]+$/.test(tPart) || /^[白赤青緑黄黒紫]$/.test(tPart)) {
        console.log(`  tPart ${j} matches flat color:`, tPart);
      } else {
        console.log(`  tPart ${j} is text:`, JSON.stringify(tPart));
      }
    });
  }
});
