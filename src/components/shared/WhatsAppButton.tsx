"use client";
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  businessName?: string;
  className?: string;
}

export default function WhatsAppButton({ 
  phoneNumber, 
  message = "Hello! I found your business on BizGallery and would like to know more.", 
  businessName,
  className = "" 
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    // Format phone number (remove +, spaces, dashes)
    const formattedPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2 ${className}`}
      title={`Contact ${businessName || 'business'} on WhatsApp`}
    >
      <MessageCircle size={16} />
      <span>WhatsApp</span>
    </button>
  );
}
