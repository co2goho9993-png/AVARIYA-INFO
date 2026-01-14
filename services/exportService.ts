
import { DocumentState } from '../types';
import { PAGE_WIDTH, PAGE_HEIGHT, A4_WIDTH_MM, A4_HEIGHT_MM } from '../constants';

/**
 * Генерирует финальную SVG строку для страницы, оптимизированную для Adobe Illustrator.
 */
const generatePageSVG = (documentState: DocumentState, pageId: string): string => {
  const page = documentState.pages.find(p => p.id === pageId);
  if (!page) return '';

  const pageElement = document.getElementById(`page-svg-container-${page.id}`);
  if (!pageElement) return '';

  const pageRect = pageElement.getBoundingClientRect();
  
  const scaleStr = document.querySelector('.origin-top-left')?.getAttribute('style')?.match(/scale\(([^)]+)\)/)?.[1] || '1';
  const currentScale = parseFloat(scaleStr);

  const xmlEscape = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/\u00A0/g, ' '); 
  };

  let globalDefs = '';
  const processedDefIds = new Set<string>();

  const cloneSvgNode = (node: Element, internalScale: number): string => {
    const tagName = node.tagName.toLowerCase();
    const style = window.getComputedStyle(node);
    
    if (node.classList.contains('no-export') && !node.classList.contains('block-svg-export')) return '';
    if (style.display === 'none' || style.visibility === 'hidden') return '';

    let currentInternalScale = internalScale;
    const transform = node.getAttribute('transform');
    if (transform && transform.includes('scale')) {
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        currentInternalScale *= parseFloat(scaleMatch[1]);
      }
    }

    if (tagName === 'lineargradient' || tagName === 'radialgradient' || tagName === 'pattern') {
      const id = node.getAttribute('id');
      if (id && !processedDefIds.has(id)) {
        globalDefs += node.outerHTML;
        processedDefIds.add(id);
      }
      return '';
    }
    
    if (tagName === 'defs') {
      Array.from(node.children).forEach(child => cloneSvgNode(child, currentInternalScale));
      return '';
    }

    if (tagName === 'stop') return node.outerHTML;

    let attributes = '';
    const attrNames = node.getAttributeNames();
    attrNames.forEach(name => {
      const val = node.getAttribute(name) || '';
      attributes += ` ${name}="${xmlEscape(val)}"`;
    });

    const styleToAttrMap: Record<string, string> = {
      'fill': style.fill,
      'stroke': style.stroke,
      'stroke-width': style.strokeWidth,
      'stroke-dasharray': style.strokeDasharray,
      'opacity': style.opacity,
      'stroke-linecap': style.strokeLinecap,
      'stroke-linejoin': style.strokeLinejoin,
      'font-size': style.fontSize,
      'font-weight': style.fontWeight,
      'font-family': style.fontFamily,
      'text-anchor': style.textAnchor,
      'letter-spacing': style.letterSpacing
    };

    Object.entries(styleToAttrMap).forEach(([attr, val]) => {
      if (attrNames.includes(attr)) return;
      
      const isCriticalNone = (attr === 'fill' || attr === 'stroke') && val === 'none';
      if (!isCriticalNone && (!val || val === 'none' || val === 'normal' || val.includes('rgba(0, 0, 0, 0)'))) return;

      if (attr === 'stroke-width' || attr === 'font-size') {
        const num = parseFloat(val) * currentInternalScale;
        attributes += ` ${attr}="${num.toFixed(4)}"`;
      } else if (attr === 'letter-spacing' && val !== 'normal') {
        const num = parseFloat(val) * currentInternalScale;
        attributes += ` ${attr}="${num.toFixed(4)}"`;
      } else if (attr === 'stroke-dasharray' && val !== 'none') {
        const parts = val.split(/[\s,]+/).map(p => (parseFloat(p) * currentInternalScale).toFixed(4));
        attributes += ` ${attr}="${parts.join(',')}"`;
      } else {
        attributes += ` ${attr}="${xmlEscape(val)}"`;
      }
    });

    let children = '';
    if (tagName === 'text') {
      children = xmlEscape(node.textContent || '');
    } else {
      for (const child of Array.from(node.children)) {
        children += cloneSvgNode(child, currentInternalScale);
      }
    }

    return `<${tagName}${attributes}>${children}</${tagName}>`;
  };

  const getLineFragments = (textNode: Text) => {
    const range = document.createRange();
    const fragments: { text: string; rect: DOMRect }[] = [];
    const text = textNode.textContent || '';
    
    let currentLineY = -1;
    let currentLineText = '';
    let currentLineRect: DOMRect | null = null;

    for (let i = 0; i < text.length; i++) {
      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);
      const rect = range.getBoundingClientRect();
      
      if (rect.width === 0) continue;

      if (currentLineY === -1 || Math.abs(rect.top - currentLineY) > rect.height * 0.4) {
        if (currentLineText.trim()) {
          fragments.push({ text: currentLineText, rect: currentLineRect! });
        }
        currentLineY = rect.top;
        currentLineText = text[i];
        currentLineRect = rect;
      } else {
        currentLineText += text[i];
        if (currentLineRect) {
          const left = Math.min(currentLineRect.left, rect.left);
          const top = Math.min(currentLineRect.top, rect.top);
          const right = Math.max(currentLineRect.right, rect.right);
          const bottom = Math.max(currentLineRect.bottom, rect.bottom);
          currentLineRect = new DOMRect(left, top, right - left, bottom - top);
        }
      }
    }

    if (currentLineText.trim()) {
      fragments.push({ text: currentLineText, rect: currentLineRect! });
    }

    return fragments;
  };

  const walkHtml = (el: Element): string => {
    let content = '';
    const tagName = el.tagName.toLowerCase();
    
    if ((el.classList.contains('no-export') && !el.classList.contains('block-svg-export')) || tagName === 'svg') return '';

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return '';

    const rect = el.getBoundingClientRect();
    const x = (rect.left - pageRect.left) / currentScale;
    const y = (rect.top - pageRect.top) / currentScale;
    const w = rect.width / currentScale;
    const h = rect.height / currentScale;

    const bgColor = style.backgroundColor;
    const bgImage = style.backgroundImage;
    // Используем borderTopLeftRadius для получения точного значения радиуса
    const borderRadius = parseFloat(style.borderTopLeftRadius) || 0;

    if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      content += `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${w.toFixed(3)}" height="${h.toFixed(3)}" rx="${borderRadius.toFixed(3)}" fill="${bgColor}" />`;
    }

    if (bgImage && bgImage.includes('linear-gradient')) {
      const colors = bgImage.match(/rgb\(\d+, \d+, \d+\)|rgba\(\d+, \d+, \d+, [\d.]+\)/g);
      if (colors && colors.length >= 2) {
        const gradId = `bg-grad-${Math.random().toString(36).substr(2, 5)}`;
        globalDefs += `
          <linearGradient id="${gradId}" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${colors[0]}" />
            <stop offset="100%" stop-color="${colors[colors.length-1]}" />
          </linearGradient>`;
        content += `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${w.toFixed(3)}" height="${h.toFixed(3)}" rx="${borderRadius.toFixed(3)}" fill="url(#${gradId})" />`;
      }
    }

    const btw = parseFloat(style.borderTopWidth);
    const bbw = parseFloat(style.borderBottomWidth);
    const blw = parseFloat(style.borderLeftWidth);
    const brw = parseFloat(style.borderRightWidth);
    
    const bStyleTop = style.borderTopStyle;
    const bStyleBottom = style.borderBottomStyle;
    const bStyleLeft = style.borderLeftStyle;
    const bStyleRight = style.borderRightStyle;
    
    const getDashArray = (width: number, type: string) => {
      if (type === 'dashed') return ` stroke-dasharray="${(width * 3.5).toFixed(2)},${(width * 2.5).toFixed(2)}"`;
      if (type === 'dotted') return ` stroke-dasharray="${(width * 1).toFixed(2)},${(width * 2.5).toFixed(2)}"`;
      return '';
    };

    // Отрисовка границ (Top, Bottom, Left, Right)
    // Если толщина границ одинаковая — рисуем одну rect рамку (это лучше для Illustrator)
    if (btw > 0 && Math.abs(btw - bbw) < 0.1 && Math.abs(btw - blw) < 0.1 && Math.abs(btw - brw) < 0.1) {
      const bc = style.borderTopColor;
      const sw = btw;
      const dash = getDashArray(sw, bStyleTop);
      content += `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${w.toFixed(3)}" height="${h.toFixed(3)}" rx="${borderRadius.toFixed(3)}" fill="none" stroke="${bc}" stroke-width="${sw.toFixed(3)}"${dash} />`;
    } else {
      if (btw > 0 && !style.borderTopColor.includes('rgba(0, 0, 0, 0)')) {
        const bc = style.borderTopColor;
        const sw = btw; 
        const dash = getDashArray(sw, bStyleTop);
        content += `<line x1="${x.toFixed(3)}" y1="${y.toFixed(3)}" x2="${(x + w).toFixed(3)}" y2="${y.toFixed(3)}" stroke="${bc}" stroke-width="${sw.toFixed(3)}"${dash} />`;
      }
      if (bbw > 0 && !style.borderBottomColor.includes('rgba(0, 0, 0, 0)')) {
        const bc = style.borderBottomColor;
        const sw = bbw;
        const dash = getDashArray(sw, bStyleBottom);
        content += `<line x1="${x.toFixed(3)}" y1="${(y + h).toFixed(3)}" x2="${(x + w).toFixed(3)}" y2="${(y + h).toFixed(3)}" stroke="${bc}" stroke-width="${sw.toFixed(3)}"${dash} />`;
      }
      if (blw > 0 && !style.borderLeftColor.includes('rgba(0, 0, 0, 0)')) {
        const bc = style.borderLeftColor;
        const sw = blw;
        const dash = getDashArray(sw, bStyleLeft);
        content += `<line x1="${x.toFixed(3)}" y1="${y.toFixed(3)}" x2="${x.toFixed(3)}" y2="${(y + h).toFixed(3)}" stroke="${bc}" stroke-width="${sw.toFixed(3)}"${dash} />`;
      }
      if (brw > 0 && !style.borderRightColor.includes('rgba(0, 0, 0, 0)')) {
        const bc = style.borderRightColor;
        const sw = brw;
        const dash = getDashArray(sw, bStyleRight);
        content += `<line x1="${(x + w).toFixed(3)}" y1="${y.toFixed(3)}" x2="${(x + w).toFixed(3)}" y2="${(y + h).toFixed(3)}" stroke="${bc}" stroke-width="${sw.toFixed(3)}"${dash} />`;
      }
    }

    if (tagName === 'img') {
      content += `<image x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${w.toFixed(3)}" height="${h.toFixed(3)}" href="${xmlEscape((el as HTMLImageElement).src)}" />`;
    }

    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragments = getLineFragments(child as Text);
        fragments.forEach(frag => {
          const fr = frag.rect;
          const fx = (fr.left - pageRect.left) / currentScale;
          const fy = (fr.top - pageRect.top) / currentScale;
          const fw = fr.width / currentScale;
          const fh = fr.height / currentScale;

          const fontSize = parseFloat(style.fontSize); 
          const fontWeight = style.fontWeight;
          const fontColor = style.color;
          const textAlign = style.textAlign;
          const fontFamily = style.fontFamily.replace(/"/g, '');
          const letterSpacing = style.letterSpacing !== 'normal' ? parseFloat(style.letterSpacing) : 0;
          
          let anchor = 'start';
          let tx = fx;
          if (textAlign === 'center') { anchor = 'middle'; tx = fx + fw/2; }
          else if (textAlign === 'right') { anchor = 'end'; tx = fx + fw; }

          const dy_offset = fontSize * 0.32; 
          const ty = fy + fh / 2 + dy_offset;

          content += `<text x="${tx.toFixed(3)}" y="${ty.toFixed(3)}" fill="${fontColor}" font-family="${xmlEscape(fontFamily)}" font-size="${fontSize.toFixed(3)}" font-weight="${fontWeight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}" xml:space="preserve">${xmlEscape(frag.text)}</text>`;
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        content += walkHtml(child as Element);
      }
    }

    return content;
  };

  const processBlock = (blockEl: Element): string => {
    let result = '';
    result += walkHtml(blockEl);

    blockEl.querySelectorAll('svg').forEach(svg => {
      const isMarkedForExport = svg.classList.contains('block-svg-export');
      if (svg.closest('.no-export') && !isMarkedForExport) return;
      
      const sRect = svg.getBoundingClientRect();
      const sx = (sRect.left - pageRect.left) / currentScale;
      const sy = (sRect.top - pageRect.top) / currentScale;
      const sw = sRect.width / currentScale;
      const sh = sRect.height / currentScale;

      const viewBox = svg.getAttribute('viewBox');
      let transform = `translate(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      
      let scale = 1;
      if (viewBox) {
        const vb = viewBox.split(/[ ,]+/).map(Number);
        if (vb[2] > 0) {
          scale = sw / vb[2];
          transform += ` scale(${scale.toFixed(6)})`;
        }
      }

      result += `<g transform="${transform}">`;
      for (const child of Array.from(svg.children)) {
        result += cloneSvgNode(child, scale);
      }
      result += `</g>`;
    });

    return result;
  };

  let svgBody = `<rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="#ffffff" />`;
  const blocks = Array.from(pageElement.querySelectorAll('.block-container'));
  blocks.forEach(block => {
    svgBody += processBlock(block);
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${A4_WIDTH_MM}mm" height="${A4_HEIGHT_MM}mm" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}" version="1.1" xml:space="preserve">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&amp;display=swap');
      text { font-family: 'Montserrat', sans-serif; }
    </style>
    ${globalDefs}
  </defs>
  ${svgBody}
</svg>`.trim();
};

export const exportToSVG = (documentState: DocumentState, pageId: string) => {
  const svgContent = generatePageSVG(documentState, pageId);
  if (!svgContent) return;
  const pageIndex = documentState.pages.findIndex(p => p.id === pageId) + 1;
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgContent}`], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Layout_Page_${pageIndex}.svg`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (documentState: DocumentState) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const pagesSvg = documentState.pages.map(page => {
    const svg = generatePageSVG(documentState, page.id);
    return `<div class="p">${svg}</div>`;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>PDF Export</title>
        <style>
          @media print { 
            @page { size: A4; margin: 0; } 
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; } 
            .p { width: 210mm; height: 297mm; page-break-after: always; display: block; } 
            svg { width: 100%; height: 100%; display: block; } 
          }
          body { margin: 0; background: #222; display: flex; flex-direction: column; align-items: center; }
          .p { background: white; width: 210mm; height: 297mm; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        ${pagesSvg}
        <script>window.onload = () => setTimeout(() => { window.print(); window.close(); }, 800);</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
