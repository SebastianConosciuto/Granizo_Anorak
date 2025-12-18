import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * @param {HTMLElement} element 
 * @param {number} scale 
 * @returns {Promise<HTMLCanvasElement>} 
 */
export const captureElement = async (element, scale = 2) => {
  if (!element) {
    throw new Error('Element not found');
  }

  await new Promise(resolve => setTimeout(resolve, 100));

  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  return canvas;
};

/**
 * @param {Array<{ref: React.RefObject, name: string}>} elements
 * @param {string} filename
 */
export const exportToPDF = async (elements, filename = 'reporte') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const gap = 5;

    let currentY = margin;
    let isFirstPage = true;

    for (const { ref, name } of elements) {
      if (!ref.current) {
        console.warn(`Skipping ${name} - element not found`);
        continue;
      }

      const canvas = await captureElement(ref.current);
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const spaceNeeded = imgHeight + (isFirstPage ? 0 : gap);
      const availableSpace = pageHeight - currentY - margin;

      if (!isFirstPage && spaceNeeded > availableSpace) {
        pdf.addPage();
        currentY = margin;
      }

      if (currentY > margin) {
        currentY += gap;
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

      currentY += imgHeight;

      if (imgHeight > pageHeight - 2 * margin) {
        console.warn(`${name} is taller than page height and may be cropped`);
      }

      isFirstPage = false;
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * @param {Array<{ref: React.RefObject, name: string}>} elements 
 * @param {string} filename 
 */
export const exportToPDFWithSplitting = async (elements, filename = 'reporte') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - 2 * margin;
    const gap = 5;

    let currentY = margin;
    let isFirstPage = true;

    for (const { ref, name } of elements) {
      if (!ref.current) {
        console.warn(`Skipping ${name} - element not found`);
        continue;
      }

      const canvas = await captureElement(ref.current);
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > contentHeight) {
        const numPages = Math.ceil(imgHeight / contentHeight);
        
        for (let i = 0; i < numPages; i++) {
          if (!isFirstPage || i > 0) {
            pdf.addPage();
          }
          isFirstPage = false;

          const sourceY = (i * contentHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (contentHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sourceHeight;
          const sliceCtx = sliceCanvas.getContext('2d');
          
          sliceCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );

          const sliceImgData = sliceCanvas.toDataURL('image/png');
          const sliceImgHeight = (sourceHeight * imgWidth) / canvas.width;

          pdf.addImage(sliceImgData, 'PNG', margin, margin, imgWidth, sliceImgHeight);
        }

        currentY = margin;
      } else {
        const spaceNeeded = imgHeight + (currentY > margin ? gap : 0);
        const availableSpace = pageHeight - currentY - margin;

        if (!isFirstPage && spaceNeeded > availableSpace) {
          pdf.addPage();
          currentY = margin;
        }

        if (currentY > margin) {
          currentY += gap;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight;

        isFirstPage = false;
      }
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * @param {React.RefObject} ref 
 * @param {string} filename 
 */
export const exportToPNG = async (ref, filename = 'imagen') => {
  try {
    if (!ref.current) {
      throw new Error('Element not found');
    }

    const canvas = await captureElement(ref.current);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
};

/**
 * @param {Array<{ref: React.RefObject, name: string}>} elements
 * @param {string} baseFilename 
 */
export const exportMultipleToPNG = async (elements, baseFilename = 'reporte') => {
  try {
    for (const { ref, name } of elements) {
      if (!ref.current) {
        console.warn(`Skipping ${name} - element not found`);
        continue;
      }

      const filename = `${baseFilename}_${name.toLowerCase().replace(/\s/g, '_')}`;
      await exportToPNG(ref, filename);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    return true;
  } catch (error) {
    console.error('Error generating PNGs:', error);
    throw error;
  }
};