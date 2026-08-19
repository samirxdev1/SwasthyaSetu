import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Language = 'en' | 'hi' | 'mr' | 'gu';

export interface LanguageStrings {
  // Common
  appName: string;
  loading: string;
  retry: string;
  error: string;
  ok: string;
  cancel: string;
  back: string;
  save: string;

  // Login
  welcomeBack: string;
  loginSubtitle: string;
  emailOrPhone: string;
  password: string;
  login: string;
  forgotPassword: string;
  loginErrorTitle: string;

  // Home
  greeting: string;
  howAreYou: string;
  yourHealthId: string;
  quickActions: string;
  scanPrescription: string;
  myRecords: string;
  chronicConditions: string;
  aiChat: string;

  // Records
  recordsTitle: string;
  consultations: string;
  prescriptions: string;
  labOrders: string;
  labReports: string;
  noConsultations: string;
  noPrescriptions: string;
  noLabOrders: string;
  noLabReports: string;
  symptoms: string;
  diagnosis: string;
  status: string;
  date: string;
  doctor: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  testName: string;
  reportSummary: string;

  // Chronic Conditions
  conditionsTitle: string;
  noConditions: string;
  diagnosed: string;
  active: string;
  managed: string;
  resolved: string;
  notes: string;

  // Scan
  scanTitle: string;
  scanSubtitle: string;
  takePhoto: string;
  pickFromGallery: string;
  analyzing: string;
  analyzingSubtitle: string;
  medicinesFound: string;
  explanation: string;
  disclaimer: string;
  scanAgain: string;
  noResult: string;

  // Chat
  chatTitle: string;
  typeMessage: string;
  send: string;
  chatPlaceholder: string;
  chatUnavailable: string;

  // Notifications
  notificationsTitle: string;
  noNotifications: string;
  markRead: string;
  unread: string;

  // Profile
  profileTitle: string;
  personalInfo: string;
  fullName: string;
  healthId: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  settings: string;
  languagePreference: string;
  logout: string;
  logoutConfirm: string;
  yes: string;
  no: string;
}

const translations: Record<Language, LanguageStrings> = {
  en: {
    appName: 'SwasthyaSetu',
    loading: 'Loading...',
    retry: 'Retry',
    error: 'Error',
    ok: 'OK',
    cancel: 'Cancel',
    back: 'Back',
    save: 'Save',
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Sign in to access your health records',
    emailOrPhone: 'Email or Phone',
    password: 'Password',
    login: 'Sign In',
    forgotPassword: 'Forgot password?',
    loginErrorTitle: 'Login Failed',
    greeting: 'Hello',
    howAreYou: 'How are you feeling today?',
    yourHealthId: 'Your Health ID',
    quickActions: 'Quick Actions',
    scanPrescription: 'Scan\nPrescription',
    myRecords: 'My\nRecords',
    chronicConditions: 'Chronic\nConditions',
    aiChat: 'AI Health\nAssistant',
    recordsTitle: 'My Health Records',
    consultations: 'Consultations',
    prescriptions: 'Prescriptions',
    labOrders: 'Lab Orders',
    labReports: 'Lab Reports',
    noConsultations: 'No consultations yet. Your visit history will appear here.',
    noPrescriptions: 'No prescriptions yet. Medications prescribed by your doctor will appear here.',
    noLabOrders: 'No lab orders yet. Tests requested by your doctor will appear here.',
    noLabReports: 'No lab reports yet. Completed test reports will appear here.',
    symptoms: 'Symptoms',
    diagnosis: 'Diagnosis',
    status: 'Status',
    date: 'Date',
    doctor: 'Doctor',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    instructions: 'Instructions',
    testName: 'Test',
    reportSummary: 'Report Summary',
    conditionsTitle: 'Chronic Conditions',
    noConditions: 'No chronic conditions recorded.',
    diagnosed: 'Diagnosed',
    active: 'Active',
    managed: 'Managed',
    resolved: 'Resolved',
    notes: 'Notes',
    scanTitle: 'Prescription Scanner',
    scanSubtitle: 'Upload a photo of your prescription and let AI explain it simply',
    takePhoto: 'Take Photo',
    pickFromGallery: 'Choose from Gallery',
    analyzing: 'Analyzing Prescription',
    analyzingSubtitle: 'Our AI is reading your prescription carefully...',
    medicinesFound: 'Medicines Found',
    explanation: 'Plain Language Explanation',
    disclaimer: 'Disclaimer',
    scanAgain: 'Scan Another',
    noResult: 'No result yet.',
    chatTitle: 'AI Health Assistant',
    typeMessage: 'Type your health question...',
    send: 'Send',
    chatPlaceholder: "Ask me anything about your health, medications, or reports. I'm here to help!",
    chatUnavailable: 'This feature is not available right now. Please try again later.',
    notificationsTitle: 'Notifications',
    noNotifications: 'No notifications yet.',
    markRead: 'Marked as read',
    unread: 'Unread',
    profileTitle: 'Profile & Settings',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    healthId: 'Health ID',
    dob: 'Date of Birth',
    gender: 'Gender',
    bloodGroup: 'Blood Group',
    address: 'Address',
    emergencyContact: 'Emergency Contact',
    settings: 'Settings',
    languagePreference: 'Language',
    logout: 'Sign Out',
    logoutConfirm: 'Are you sure you want to sign out?',
    yes: 'Yes',
    no: 'No',
  },
  hi: {
    appName: 'स्वास्थ्यसेतु',
    loading: 'लोड हो रहा है...',
    retry: 'पुनः प्रयास करें',
    error: 'त्रुटि',
    ok: 'ठीक है',
    cancel: 'रद्द करें',
    back: 'वापस',
    save: 'सहेजें',
    welcomeBack: 'वापसी पर स्वागत है',
    loginSubtitle: 'अपने स्वास्थ्य रिकॉर्ड तक पहुंचने के लिए साइन इन करें',
    emailOrPhone: 'ईमेल या फोन',
    password: 'पासवर्ड',
    login: 'साइन इन',
    forgotPassword: 'पासवर्ड भूल गए?',
    loginErrorTitle: 'लॉगिन विफल',
    greeting: 'नमस्ते',
    howAreYou: 'आज आप कैसे महसूस कर रहे हैं?',
    yourHealthId: 'आपका हेल्थ आईडी',
    quickActions: 'त्वरित कार्य',
    scanPrescription: 'पर्चा\nस्कैन करें',
    myRecords: 'मेरे\nरिकॉर्ड',
    chronicConditions: 'पुरानी\nबीमारियाँ',
    aiChat: 'AI स्वास्थ्य\nसहायक',
    recordsTitle: 'मेरे स्वास्थ्य रिकॉर्ड',
    consultations: 'परामर्श',
    prescriptions: 'पर्चे',
    labOrders: 'लेब ऑर्डर',
    labReports: 'लेब रिपोर्ट',
    noConsultations: 'अभी कोई परामर्श नहीं। आपकी यात्रा का इतिहास यहां दिखाई देगा।',
    noPrescriptions: 'अभी कोई पर्चा नहीं। आपके डॉक्टर द्वारा बताई गई दवाइयाँ यहां दिखाई देंगी।',
    noLabOrders: 'अभी कोई लेब ऑर्डर नहीं। आपके डॉक्टर द्वारा अनुरोधित परीक्षण यहां दिखाई देंगे।',
    noLabReports: 'अभी कोई लेब रिपोर्ट नहीं। पूर्ण परीक्षण रिपोर्ट यहां दिखाई देंगी।',
    symptoms: 'लक्षण',
    diagnosis: 'निदान',
    status: 'स्थिति',
    date: 'तारीख',
    doctor: 'डॉक्टर',
    dosage: 'खुराक',
    frequency: 'आवृत्ति',
    duration: 'अवधि',
    instructions: 'निर्देश',
    testName: 'परीक्षण',
    reportSummary: 'रिपोर्ट सारांश',
    conditionsTitle: 'पुरानी बीमारियाँ',
    noConditions: 'कोई पुरानी बीमारी दर्ज नहीं।',
    diagnosed: 'निदान किया गया',
    active: 'सक्रिय',
    managed: 'नियंत्रित',
    resolved: 'ठीक हुआ',
    notes: 'नोट्स',
    scanTitle: 'पर्चा स्कैनर',
    scanSubtitle: 'अपने पर्चे की फोटो अपलोड करें और AI को सरल भाषा में समझाएं',
    takePhoto: 'फोटो लें',
    pickFromGallery: 'गैलरी से चुनें',
    analyzing: 'पर्चा विश्लेषण हो रहा है',
    analyzingSubtitle: 'हमारा AI आपके पर्चे को ध्यान से पढ़ रहा है...',
    medicinesFound: 'पाई गई दवाइयाँ',
    explanation: 'सरल भाषा में व्याख्या',
    disclaimer: 'अस्वीकरण',
    scanAgain: 'दोबारा स्कैन करें',
    noResult: 'अभी कोई परिणाम नहीं।',
    chatTitle: 'AI स्वास्थ्य सहायक',
    typeMessage: 'अपना स्वास्थ्य प्रश्न टाइप करें...',
    send: 'भेजें',
    chatPlaceholder: 'अपने स्वास्थ्य, दवाइयों या रिपोर्ट के बारे में कुछ भी पूछें। मैं मदद के लिए यहां हूं!',
    chatUnavailable: 'यह सुविधा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    notificationsTitle: 'सूचनाएँ',
    noNotifications: 'अभी कोई सूचना नहीं।',
    markRead: 'पढ़ा हुआ चिह्नित',
    unread: 'अपठित',
    profileTitle: 'प्रोफ़ाइल और सेटिंग्स',
    personalInfo: 'व्यक्तिगत जानकारी',
    fullName: 'पूरा नाम',
    healthId: 'हेल्थ आईडी',
    dob: 'जन्म तारीख',
    gender: 'लिंग',
    bloodGroup: 'ब्लड ग्रुप',
    address: 'पता',
    emergencyContact: 'आपातकालीन संपर्क',
    settings: 'सेटिंग्स',
    languagePreference: 'भाषा',
    logout: 'साइन आउट',
    logoutConfirm: 'क्या आप वाकई साइन आउट करना चाहते हैं?',
    yes: 'हाँ',
    no: 'नहीं',
  },
  mr: {
    appName: 'स्वास्थ्यसेतु',
    loading: 'लोड होत आहे...',
    retry: 'पुन्हा प्रयत्न करा',
    error: 'त्रुटी',
    ok: 'ठीक',
    cancel: 'रद्द करा',
    back: 'मागे',
    save: 'जतन करा',
    welcomeBack: 'परत स्वागत',
    loginSubtitle: 'तुमच्या आरोग्य रेकॉर्डमध्ये प्रवेश करण्यासाठी साइन इन करा',
    emailOrPhone: 'इमेल किंवा फोन',
    password: 'पासवर्ड',
    login: 'साइन इन',
    forgotPassword: 'पासवर्ड विसरलात?',
    loginErrorTitle: 'लॉगिन अयशस्वी',
    greeting: 'नमस्कार',
    howAreYou: 'आज तुम्ही कसे वाटत आहात?',
    yourHealthId: 'तुमचा हेल्थ आयडी',
    quickActions: 'त्वरित क्रिया',
    scanPrescription: 'प्रिस्क्रिप्शन\nस्कॅन करा',
    myRecords: 'माझे\nरेकॉर्ड',
    chronicConditions: 'जुन्या\nआजार',
    aiChat: 'AI आरोग्य\nसहाय्यक',
    recordsTitle: 'माझे आरोग्य रेकॉर्ड',
    consultations: 'सल्लागिरी',
    prescriptions: 'प्रिस्क्रिप्शन',
    labOrders: 'लॅब ऑर्डर',
    labReports: 'लॅब रिपोर्ट',
    noConsultations: 'अद्याप कोणतेही सल्लागिरी नाही. तुमची भेट इतिहास येथे दिसेल.',
    noPrescriptions: 'अद्याप कोणतेही प्रिस्क्रिप्शन नाही. तुमच्या डॉक्टरांनी लिहिलेल्या औषधे येथे दिसतील.',
    noLabOrders: 'अद्याप कोणतेही लॅब ऑर्डर नाही. तुमच्या डॉक्टरांनी विनंती केलेल्या चाचण्या येथे दिसतील.',
    noLabReports: 'अद्याप कोणतीही लॅब रिपोर्ट नाही. पूर्ण झालेल्या चाचणी अहवाल येथे दिसतील.',
    symptoms: 'लक्षणे',
    diagnosis: 'निदान',
    status: 'स्थिती',
    date: 'तारीख',
    doctor: 'डॉक्टर',
    dosage: 'डोस',
    frequency: 'वारंवारता',
    duration: 'मुदत',
    instructions: 'सूचना',
    testName: 'चाचणी',
    reportSummary: 'अहवाल सारांश',
    conditionsTitle: 'जुन्या आजार',
    noConditions: 'कोणतेही जुने आजार नोंदवलेले नाहीत.',
    diagnosed: 'निदान',
    active: 'सक्रिय',
    managed: 'व्यवस्थापित',
    resolved: 'बरे',
    notes: 'टीप',
    scanTitle: 'प्रिस्क्रिप्शन स्कॅनर',
    scanSubtitle: 'तुमच्या प्रिस्क्रिप्शनचा फोटो अपलोड करा आणि AI ला सोप्या भाषेत समजून घ्या',
    takePhoto: 'फोटो घ्या',
    pickFromGallery: 'गॅलरीमधून निवडा',
    analyzing: 'प्रिस्क्रिप्शनचे विश्लेषण होत आहे',
    analyzingSubtitle: 'आमचा AI तुमच्या प्रिस्क्रिप्शनला काळजीपूर्वक वाचत आहे...',
    medicinesFound: 'सापडलेली औषधे',
    explanation: 'सोप्या भाषेत स्पष्टीकरण',
    disclaimer: 'अस्वीकरण',
    scanAgain: 'पुन्हा स्कॅन करा',
    noResult: 'अद्याप कोणतेही परिणाम नाहीत.',
    chatTitle: 'AI आरोग्य सहाय्यक',
    typeMessage: 'तुमचा आरोग्य प्रश्न टाइप करा...',
    send: 'पाठवा',
    chatPlaceholder: 'तुमच्या आरोग्य, औषधे किंवा अहवालांबद्दल काहीही विचारा. मी मदतीसाठी येथे आहे!',
    chatUnavailable: 'ही सुविधा सध्या उपलब्ध नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    notificationsTitle: 'सूचना',
    noNotifications: 'सध्या कोणत्याही सूचना नाहीत.',
    markRead: 'वाचलेले म्हणून चिन्हांकित',
    unread: 'न वाचलेले',
    profileTitle: 'प्रोफाइल आणि सेटिंग्ज',
    personalInfo: 'वैयक्तिक माहिती',
    fullName: 'पूर्ण नाव',
    healthId: 'हेल्थ आयडी',
    dob: 'जन्म तारीख',
    gender: 'लिंग',
    bloodGroup: 'रक्त गट',
    address: 'पत्ता',
    emergencyContact: 'आपत्कालीन संपर्क',
    settings: 'सेटिंग्ज',
    languagePreference: 'भाषा',
    logout: 'साइन आउट',
    logoutConfirm: 'तुम्हाला खात्री आहे की तुम्ही साइन आउट करायचे आहे?',
    yes: 'होय',
    no: 'नाही',
  },
  gu: {
    appName: 'સ્વાસ્થ્યસેતુ',
    loading: 'લોડ થઈ રહ્યું છે...',
    retry: 'ફરી પ્રયાસ કરો',
    error: 'ભૂલ',
    ok: 'ઠીક છે',
    cancel: 'રદ કરો',
    back: 'પાછા',
    save: 'સાચવો',
    welcomeBack: 'પાછા આવવા પર સ્વાગત',
    loginSubtitle: 'તમારા સ્વાસ્થ્ય રેકોર્ડ્સને ઍક્સેસ કરવા માટે સાઇન ઇન કરો',
    emailOrPhone: 'ઇમેઇલ અથવા ફોન',
    password: 'પાસવર્ડ',
    login: 'સાઇન ઇન',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    loginErrorTitle: 'લૉગિન નિષ્ફળ',
    greeting: 'નમસ્તે',
    howAreYou: 'આજે તમે કેવું અનુભવો છો?',
    yourHealthId: 'તમારું હેલ્થ આઈડી',
    quickActions: 'ઝડપી ક્રિયાઓ',
    scanPrescription: 'પ્રિસ્ક્રિપ્શન\nસ્કેન કરો',
    myRecords: 'મારા\nરેકોર્ડ્સ',
    chronicConditions: 'ક્રોનિક\nસ્થિતિઓ',
    aiChat: 'AI સ્વાસ્થ્ય\nસહાયક',
    recordsTitle: 'મારા સ્વાસ્થ્ય રેકોર્ડ્સ',
    consultations: 'પરામર્શ',
    prescriptions: 'પ્રિસ્ક્રિપ્શન્સ',
    labOrders: 'લેબ ઓર્ડર્સ',
    labReports: 'લેબ રિપોર્ટ્સ',
    noConsultations: 'હજુ સુધી કોઈ પરામર્શ નથી. તમારી મુલાકાતનો ઇતિહાસ અહીં દેખાશે.',
    noPrescriptions: 'હજુ સુધી કોઈ પ્રિસ્ક્રિપ્શન નથી. તમારા ડૉક્ટર દ્વારા સૂચવવામાં આવેલી દવાઓ અહીં દેખાશે.',
    noLabOrders: 'હજુ સુધી કોઈ લેબ ઓર્ડર નથી. તમારા ડૉક્ટર દ્વારા વિનંતી કરાયેલા પરીક્ષણો અહીં દેખાશે.',
    noLabReports: 'હજુ સુધી કોઈ લેબ રિપોર્ટ નથી. પૂર્ણ થયેલા પરીક્ષણ રિપોર્ટ્સ અહીં દેખાશે.',
    symptoms: 'લક્ષણો',
    diagnosis: 'નિદાન',
    status: 'સ્થિતિ',
    date: 'તારીખ',
    doctor: 'ડૉક્ટર',
    dosage: 'ડોઝ',
    frequency: 'આવર્તન',
    duration: 'સમયગાળો',
    instructions: 'સૂચનો',
    testName: 'પરીક્ષણ',
    reportSummary: 'રિપોર્ટ સારાંશ',
    conditionsTitle: 'ક્રોનિક સ્થિતિઓ',
    noConditions: 'કોઈ ક્રોનિક સ્થિતિઓ નોંધવામાં આવી નથી.',
    diagnosed: 'નિદાન',
    active: 'સક્રિય',
    managed: 'વ્યવસ્થાપિત',
    resolved: 'ઉકેલાઈ',
    notes: 'નોંધો',
    scanTitle: 'પ્રિસ્ક્રિપ્શન સ્કેનર',
    scanSubtitle: 'તમારા પ્રિસ્ક્રિપ્શનનો ફોટો અપલોડ કરો અને AI ને સરળ ભાષામાં સમજાવો',
    takePhoto: 'ફોટો લો',
    pickFromGallery: 'ગેલેરીમાંથી પસંદ કરો',
    analyzing: 'પ્રિસ્ક્રિપ્શનનું વિશ્લેષણ થઈ રહ્યું છે',
    analyzingSubtitle: 'અમારું AI તમારા પ્રિસ્ક્રિપ્શનને ધ્યાનથી વાંચી રહ્યું છે...',
    medicinesFound: 'મળેલી દવાઓ',
    explanation: 'સરળ ભાષામાં સમજૂતી',
    disclaimer: 'નકારાત્મક',
    scanAgain: 'ફરીથી સ્કેન કરો',
    noResult: 'હજુ સુધી કોઈ પરિણામ નથી.',
    chatTitle: 'AI સ્વાસ્થ્ય સહાયક',
    typeMessage: 'તમારો સ્વાસ્થ્ય પ્રશ્ન ટાઇપ કરો...',
    send: 'મોકલો',
    chatPlaceholder: 'તમારા સ્વાસ્થ્ય, દવાઓ અથવા રિપોર્ટ્સ વિશે કંઈપણ પૂછો. હું મદદ કરવા અહીં છું!',
    chatUnavailable: 'આ સુવિધા અત્યારે ઉપલબ્ધ નથી. કૃપયા પછીથી ફરી પ્રયાસ કરો.',
    notificationsTitle: 'સૂચનાઓ',
    noNotifications: 'હજુ સુધી કોઈ સૂચનાઓ નથી.',
    markRead: 'વાંચેલું તરીકે ચિહ્નિત',
    unread: 'ન વાંચેલું',
    profileTitle: 'પ્રોફાઇલ અને સેટિંગ્સ',
    personalInfo: 'વ્યક્તિગત માહિતી',
    fullName: 'સંપૂર્ણ નામ',
    healthId: 'હેલ્થ આઈડી',
    dob: 'જન્મ તારીખ',
    gender: 'લિંગ',
    bloodGroup: 'બ્લડ ગ્રુપ',
    address: 'સરનામું',
    emergencyContact: 'ઇમરજન્સી સંપર્ક',
    settings: 'સેટિંગ્સ',
    languagePreference: 'ભાષા',
    logout: 'સાઇન આઉટ',
    logoutConfirm: 'શું તમને ખાતરી છે કે તમે સાઇન આઉટ કરવા માંગો છો?',
    yes: 'હા',
    no: 'ના',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: LanguageStrings;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
        if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr' || stored === 'gu')) {
          setLanguageState(stored);
        }
      } catch (_err) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
    } catch (_err) {
      // ignore
    }
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isLoading,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
