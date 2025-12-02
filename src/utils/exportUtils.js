import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a DOM element as a canvas with high quality
 * @param {HTMLElement} element - The element to capture
 * @param {number} scale - Quality scale (default: 2 for high quality)
 * @returns {Promise<HTMLCanvasElement>} Canvas element
 */
export const captureElement = async (element, scale = 2) => {
  if (!element) {
    throw new Error('Element not found');
  }

  // Wait a bit for any animations to settle
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
 * Exports multiple elements to a single PDF
 * @param {Array<{ref: React.RefObject, name: string}>} elements - Array of refs and names
 * @param {string} filename - PDF filename without extension
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
    const gap = 5; // Gap between images on same page

    let currentY = margin; // Track vertical position on current page
    let isFirstPage = true;

    for (const { ref, name } of elements) {
      if (!ref.current) {
        console.warn(`Skipping ${name} - element not found`);
        continue;
      }

      // Capture element
      const canvas = await captureElement(ref.current);
      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions to fit page width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if image fits on current page
      const spaceNeeded = imgHeight + (isFirstPage ? 0 : gap);
      const availableSpace = pageHeight - currentY - margin;

      if (!isFirstPage && spaceNeeded > availableSpace) {
        // Image doesn't fit, start new page
        pdf.addPage();
        currentY = margin;
      }

      // Add gap before image (except for first image on page)
      if (currentY > margin) {
        currentY += gap;
      }

      // Add image to PDF at current position
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

      // Update vertical position for next image
      currentY += imgHeight;

      // Warn if single image is taller than a full page
      if (imgHeight > pageHeight - 2 * margin) {
        console.warn(`${name} is taller than page height and may be cropped`);
      }

      isFirstPage = false;
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Exports multiple elements to a single PDF with support for splitting tall images
 * @param {Array<{ref: React.RefObject, name: string}>} elements - Array of refs and names
 * @param {string} filename - PDF filename without extension
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

      // Capture element
      const canvas = await captureElement(ref.current);
      const imgData = canvas.toDataURL('image/png');

      // Calculate dimensions to fit page width
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If image is taller than a page, split it
      if (imgHeight > contentHeight) {
        // Calculate how many pages needed
        const numPages = Math.ceil(imgHeight / contentHeight);
        
        for (let i = 0; i < numPages; i++) {
          // Add new page if needed
          if (!isFirstPage || i > 0) {
            pdf.addPage();
          }
          isFirstPage = false;

          // Calculate the portion of image for this page
          const sourceY = (i * contentHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (contentHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );

          // Create temporary canvas for this slice
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

        currentY = margin; // Reset for next element
      } else {
        // Image fits on a page, use regular logic
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
 * Exports a single element as PNG image
 * @param {React.RefObject} ref - Element reference
 * @param {string} filename - Image filename without extension
 */
export const exportToPNG = async (ref, filename = 'imagen') => {
  try {
    if (!ref.current) {
      throw new Error('Element not found');
    }

    const canvas = await captureElement(ref.current);
    
    // Convert to blob and download
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
 * Exports multiple elements as separate PNG images
 * @param {Array<{ref: React.RefObject, name: string}>} elements - Array of refs and names
 * @param {string} baseFilename - Base filename (will be appended with element name)
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
      
      // Small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    return true;
  } catch (error) {
    console.error('Error generating PNGs:', error);
    throw error;
  }
};