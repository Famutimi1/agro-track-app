"use client";

import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportOptions {
  filename?: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  margin?: number;
  quality?: number;
  scale?: number;
}

interface ExportResult {
  success: boolean;
  error?: string;
}

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);

  const exportToPdf = useCallback(
    async (
      elementRef: React.RefObject<HTMLElement | null>,
      options: ExportOptions = {}
    ): Promise<ExportResult> => {
      const {
        filename = "export",
        title,
        orientation = "portrait",
        format = "a4",
        margin = 10,
        quality = 0.95,
        scale = 2,
      } = options;

      if (!elementRef.current) {
        return { success: false, error: "Element not found" };
      }

      setExporting(true);

      try {
        const element = elementRef.current;

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });

        // Calculate dimensions
        const imgData = canvas.toDataURL("image/jpeg", quality);
        const pdf = new jsPDF({
          orientation,
          unit: "mm",
          format,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add title if provided
        let yOffset = margin;
        if (title) {
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(title, margin, yOffset + 5);
          yOffset += 15;

          // Add timestamp
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(128, 128, 128);
          const timestamp = new Date().toLocaleString("en-NG", {
            dateStyle: "full",
            timeStyle: "short",
          });
          pdf.text(`Generated: ${timestamp}`, margin, yOffset);
          yOffset += 10;
          pdf.setTextColor(0, 0, 0);
        }

        // Handle multi-page content
        let heightLeft = imgHeight;
        let position = yOffset;
        const availableHeight = pageHeight - margin - yOffset;

        // First page
        const firstPageHeight = Math.min(imgHeight, availableHeight);
        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        heightLeft -= availableHeight;

        // Additional pages if content overflows
        while (heightLeft > 0) {
          pdf.addPage();
          position = margin - (imgHeight - heightLeft);
          pdf.addImage(
            imgData,
            "JPEG",
            margin,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );
          heightLeft -= pageHeight - margin * 2;
        }

        // Add page numbers
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pageWidth - margin - 20,
            pageHeight - 5
          );
        }

        // Save the PDF
        pdf.save(`${filename}.pdf`);

        return { success: true };
      } catch (error) {
        console.error("PDF export failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Export failed",
        };
      } finally {
        setExporting(false);
      }
    },
    []
  );

  return { exportToPdf, exporting };
}
