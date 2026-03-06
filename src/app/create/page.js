"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, MapPin, Phone, ArrowRight, Clock, Store, Sparkles, Zap, CheckCircle, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import LocationPicker from '@/components/LocationPicker';

export default function CreateWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    name: '',
    category: 'Grocery',
    location: '',
    whatsapp: '',
    description: '',
    opening_time: '',
    closing_time: '',
    latitude: null,
    longitude: null,
    image_url: ''
  });
  
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
  
  const handleLocationSelect = (location) => {
    setForm({...form, latitude: location.lat, longitude: location.lng});
  };
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if(file) {
      if (file.size > 1024 * 1024) {
        alert("Please select an image smaller than 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setForm({...form, image_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    const slug = form.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000);

    const { error } = await supabase.from('businesses').insert([{
      user_id: user.id,
      name: form.name,
      category: form.category,
      location: form.location,
      description: form.description,
      whatsapp: form.whatsapp,
      opening_time: form.opening_time,
      closing_time: form.closing_time,
      latitude: form.latitude,
      longitude: form.longitude,
      image_url: form.image_url,
      slug: slug,
      verified: true, 
    }]);

    setLoading(false); 

    if (error) {
      alert("Database Error: " + error.message);
    } else {
      alert("✅ Shop Created!");
      router.push('/dashboard');
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-violet-100 dark:border-violet-800/50">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <ArrowLeft className="text-white" />
              </Link>
              <div className="flex items-center gap-3">
                <Store className="text-yellow-300" size={24} />
                <h2 className="text-2xl font-bold">Create Your Shop</h2>
              </div>
              <div className="w-12"></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Step {step} of 4</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Let's start with the essentials</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Store size={20} className="text-violet-600" />
                    Shop Name
                  </label>
                  <input 
                    name="name" 
                    onChange={handleChange} 
                    placeholder="e.g. Sharma Electronics" 
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm" 
                    required 
                    autoFocus 
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-violet-600" />
                    Category
                  </label>
                  <select 
                    name="category" 
                    onChange={handleChange} 
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm"
                  >
                    <option>Grocery</option>
                    <option>Fashion</option>
                    <option>Electronics</option>
                    <option>Food</option>
                    <option>Services</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={nextStep} 
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-3"
              >
                <span>Continue</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Details</h3>
                <p className="text-gray-600 dark:text-gray-400">Help customers find and reach you</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Location
                  </label>
                  <input 
                    name="location" 
                    onChange={handleChange} 
                    placeholder="City, Area, Landmark" 
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Phone size={20} className="text-green-600" />
                    WhatsApp Number
                  </label>
                  <input 
                    name="whatsapp" 
                    onChange={handleChange} 
                    type="tel" 
                    placeholder="919876543210" 
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Clock size={20} className="text-orange-600" />
                      Opening Time
                    </label>
                    <input 
                      name="opening_time" 
                      onChange={handleChange} 
                      type="time" 
                      className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Clock size={20} className="text-red-600" />
                      Closing Time
                    </label>
                    <input 
                      name="closing_time" 
                      onChange={handleChange} 
                      type="time" 
                      className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-600" />
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="What makes your shop special?" 
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 shadow-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={prevStep} 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Back
                </button>
                <button 
                  onClick={nextStep} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Location on Map</h3>
                <p className="text-gray-600 dark:text-gray-400">Pin your exact business location</p>
              </div>
              
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                initialLocation={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={prevStep} 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Back
                </button>
                <button 
                  onClick={nextStep} 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shop Photo</h3>
                <p className="text-gray-600 dark:text-gray-400">Add a photo to showcase your business</p>
              </div>
              
              <div>
                <div 
                  onClick={() => document.getElementById('file-upload').click()} 
                  className={`w-full h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 relative overflow-hidden group ${
                    preview ? 'border-solid border-pink-500' : ''
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 group-hover:scale-105 transition-transform">
                      <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Click to upload photo</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 1MB</p>
                    </div>
                  )}
                  <input 
                    id="file-upload" 
                    type="file" 
                    onChange={handleImage} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={prevStep} 
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Back
                </button>
                <button 
                  disabled={loading} 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="text-yellow-300" />
                      <span>Publish Shop</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
