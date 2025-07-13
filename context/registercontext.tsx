import React, { createContext, useContext, useState, useEffect } from 'react';

export type ReligionOption = {religion_cat_id: number; religion_name: string};
export type CivilStatusOption = { civil_stat_id: number; civil_name: string };
export type EducationOption = { educational_attain_id: number; educational_attain_name: string };
export type SitioOption = { sitio_id: number; sitio_name: string };
export type StatusOption = { status_id: number; status_name: string };


const RegisterContext = createContext<any>(null);

export const RegisterProvider = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    dob: '',
    sex: '',
    gender: '',
    is_voter: false,
    email: '',
    phone_number: '',
    religion_cat_id: '',
    civil_status: '',
    educational_attainment: '',
    house_number: '',
    street: '',
    barangay: '',
    sitio_id: '',
    city_municipality: '',
    country: 'Philippines',
    status: '',
    username: '',
    password: '',
    confirm_password: '',
    document_type: '',
    document_number: '',
    id_document_image: null,
    birth_certificate_image: null,
    date_recorded: new Date().toISOString().split('T')[0],
  });

  const [religionOptions, setReligionOptions] = useState([]);
  const [civilStatusOptions, setCivilStatusOptions] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [sitioOptions, setSitioOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);


  useEffect(() => {
    fetch('http://192.168.1.9:8000/api/religion-categories/')
      .then(res => res.json())
      .then(setReligionOptions)
      .catch(err => console.error('Religion Category fetch error:', err));

    fetch('http://192.168.1.9:8000/api/civil-statuses/')
      .then(res => res.json())
      .then(setCivilStatusOptions)
      .catch(err => console.error('Civil Status fetch error:', err));

    fetch('http://192.168.1.9:8000/api/educational-attainments/')
      .then(res => res.json())
      .then(setEducationOptions)
      .catch(err => console.error('Educational Attainment fetch error:', err));

    fetch('http://192.168.1.9:8000/api/sitios/')
      .then(res => res.json())
      .then(setSitioOptions)
      .catch(err => console.error('Sitios fetch error:', err));

    fetch('http://192.168.1.9:8000/api/resident-statuses/')
      .then(res => res.json())
      .then(setStatusOptions)
      .catch(err => console.error('Status fetch error:', err));
  }, []);

  return (
    <RegisterContext.Provider value={{ formData, setFormData, religionOptions, civilStatusOptions, educationOptions, sitioOptions, statusOptions }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => useContext(RegisterContext);
