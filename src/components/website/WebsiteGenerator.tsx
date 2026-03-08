"use client";
import { useState } from 'react';
import { Globe, ExternalLink, Copy, Check, Download, Share2, Eye, Settings, X } from 'lucide-react';

interface WebsiteGeneratorProps {
  business: any;
  onClose: () => void;
}

export default function WebsiteGenerator({ business, onClose }: WebsiteGeneratorProps) {
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [previewMode, setPreviewMode] = useState(false);

  const themes = [
    { id: 'modern', name: 'Modern', color: 'bg-blue-600' },
    { id: 'classic', name: 'Classic', color: 'bg-gray-600' },
    { id: 'vibrant', name: 'Vibrant', color: 'bg-purple-600' },
    { id: 'minimal', name: 'Minimal', color: 'bg-gray-800' }
  ];

  const generateWebsite = () => {
    // Generate a unique URL based on business name and ID
    const baseUrl = window.location.origin;
    const websiteUrl = `${baseUrl}/website/${business.slug}`;
    setGeneratedUrl(websiteUrl);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} - Website`,
          text: `Check out ${business.name} - ${business.description}`,
          url: generatedUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadWebsite = () => {
    // Generate HTML content for the website
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.slug}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${business.name} - Business Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .section { padding: 4rem 0; }
        .section h2 { font-size: 2rem; margin-bottom: 2rem; text-align: center; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .info-card { background: #f8f9fa; padding: 2rem; border-radius: 10px; }
        .contact-info { background: #f8f9fa; padding: 2rem; border-radius: 10px; margin-top: 2rem; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem; }
        .btn:hover { background: #5a67d8; }
        footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
        @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="hero">
                <h1>${business.name}</h1>
                <p>${business.description}</p>
                <div style="margin-top: 2rem;">
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">
                        ${business.category}
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; margin-left: 0.5rem;">
                        ⭐ ${business.rating || '5.0'} (${business.review_count || '0'} reviews)
                    </span>
                </div>
            </div>
        </div>
    </header>

    <main>
        <section class="section">
            <div class="container">
                <h2>About Our Business</h2>
                <p style="text-align: center; max-width: 800px; margin: 0 auto;">${business.description}</p>
                
                <div class="info-grid">
                    <div class="info-card">
                        <h3>📍 Location</h3>
                        <p>${business.address}</p>
                    </div>
                    <div class="info-card">
                        <h3>📞 Contact</h3>
                        <p>Phone: ${business.phone || 'N/A'}</p>
                        <p>Email: ${business.email || 'N/A'}</p>
                    </div>
                    <div class="info-card">
                        <h3>⏰ Hours</h3>
                        <p>Open daily with flexible hours</p>
                    </div>
                    <div class="info-card">
                        <h3>💰 Price Range</h3>
                        <p>${business.price_range || 'Affordable'}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section" style="background: #f8f9fa;">
            <div class="container">
                <h2>Get in Touch</h2>
                <div class="contact-info">
                    <p><strong>Address:</strong> ${business.address}</p>
                    ${business.phone ? `<p><strong>Phone:</strong> ${business.phone}</p>` : ''}
                    ${business.email ? `<p><strong>Email:</strong> ${business.email}</p>` : ''}
                    ${business.website ? `<p><strong>Website:</strong> <a href="${business.website}" target="_blank">${business.website}</a></p>` : ''}
                    
                    <div style="margin-top: 2rem;">
                        ${business.phone ? `<a href="tel:${business.phone}" class="btn">Call Now</a>` : ''}
                        <a href="mailto:${business.email || 'info@example.com'}" class="btn">Send Email</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 ${business.name}. All rights reserved.</p>
            <p style="margin-top: 0.5rem; opacity: 0.7;">Powered by BizGallery</p>
        </div>
    </footer>
</body>
</html>`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe size={24} className="text-violet-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generate Business Website
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a professional website for {business.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Business Preview */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {business.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {business.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {business.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {business.category}
                  </span>
                  <span className="flex items-center gap-1">
                    ⭐ {business.rating || '5.0'}
                  </span>
                  <span className="text-gray-500">
                    {business.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose Website Theme
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === theme.id
                      ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-16 ${theme.color} rounded mb-2`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={generateWebsite}
              className="w-full py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Generate Website
            </button>
          </div>

          {/* Generated URL */}
          {generatedUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Website Generated Successfully!
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your business website is ready to share
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check size={24} className="text-white" />
                  </div>
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => window.open(generatedUrl, '_blank')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye size={16} />
                  Preview Website
                </button>
                <button
                  onClick={shareWebsite}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={downloadWebsite}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download size={16} />
                  Download HTML
                </button>
              </div>

              {/* Preview Mode Toggle */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Settings size={16} />
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {/* Website Preview */}
              {previewMode && (
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Website Preview
                    </span>
                  </div>
                  <div className="h-96 bg-white overflow-auto">
                    <iframe
                      srcDoc={generateHTML()}
                      className="w-full h-full border-0"
                      title="Website Preview"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
