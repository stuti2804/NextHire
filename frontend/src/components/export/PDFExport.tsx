import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';

interface PDFExportProps {
  data: Record<string, any>;
  filename?: string;
  onComplete?: (success: boolean, message: string) => void;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  data, 
  filename = 'resume',
  onComplete = () => {} 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const resumeElement = document.getElementById('resume-content');
      if (!resumeElement) throw new Error('Resume content not found');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imageData = await htmlToImage.toPng(resumeElement);
      
      const imgProps = pdf.getImageProperties(imageData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
      
      onComplete(true, 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      onComplete(false, 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      Export PDF
    </button>
  );
};

export default PDFExport;
