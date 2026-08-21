import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import './BusinessSettings.css';
import { useToast } from '../../../hooks/useToast';
import type { BusinessItem } from '../../Business/Business';
import { useAuth } from '../../../hooks/useAuth';

interface BusinessData {
  businessName: string;
  businessDescription: string;
  businessLogoUrl: string | null;
  businessId: number;
}

export function BusinessSettings() {
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '',
    businessDescription: '',
    businessId: 1,
    businessLogoUrl: null,
  });

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL; 
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/business/my-access`, {
          credentials: 'include',
        });

        if (!res.ok) {
          showToast('No se han podido obtener los datos del negocio', 'error');
          return;
        }

        const data: BusinessItem[] = await res.json();
        setBusinesses(data);

        const ownBusiness = data.find((value) => value.businessId === user?.businessId);

        if (ownBusiness) {
          const currentLogoUrl = (ownBusiness as any).imageUrl ?? null;
          setBusinessData({
            businessName: ownBusiness.businessName ?? '',
            businessDescription: ownBusiness.businessDescription ?? '',
            businessLogoUrl: currentLogoUrl,
            businessId: ownBusiness.businessId ?? 1,
          });
          if (currentLogoUrl) {
            setPreviewImageUrl(currentLogoUrl);
          }
        }
      } catch {
        showToast('Ocurrió un error inesperado', 'error');
      }
    };

    fetchData();
  }, [apiUrl, showToast, user?.businessId]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setBusinessData((previousData) => ({ ...previousData, [name]: value }));
  }

  function handleLogoImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const generatedImageUrl = URL.createObjectURL(file);
      setPreviewImageUrl(generatedImageUrl);
    }
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('name', businessData.businessName);
    formData.append('description', businessData.businessDescription);

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch(`${apiUrl}/business/${user?.businessId}`, {
        method: "PATCH",
        credentials: 'include',
        body: formData, 
      });

      if (!res.ok) {
        showToast('No se han podido actualizar los datos del negocio', 'error');
        return;
      }

      // Lectura segura en caso de que el backend devuelva 204 No Content o JSON
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      setBusinessData((prev) => ({
        ...prev,
        businessName: data.name ?? prev.businessName,
        businessDescription: data.description ?? prev.businessDescription,
        businessLogoUrl: data.imageUrl ?? prev.businessLogoUrl,
      }));

      if (data.imageUrl) {
        setPreviewImageUrl(data.imageUrl);
      }

      setSelectedFile(null);
      showToast("Datos actualizados correctamente", "success");
    } catch (error) {
      console.error("Error al actualizar datos:", error); // Muestra el error exacto en la consola
      showToast("Ocurrió un error inesperado al actualizar datos", "error");
    } finally {
      setIsUpdating(false); // Garantiza que siempre se restablezca el estado
    }
  };

  return (
    <div className="business-settings-main-card-container">
      <form onSubmit={handleFormSubmit} className="business-settings-form-wrapper">
        <h3 className="business-settings-section-heading">Información del Negocio</h3>

        {/* Logo Section */}
        <div className="business-settings-form-field-group">
          <label className="business-settings-field-label">Logo del Negocio</label>
          <div className="business-settings-logo-upload-wrapper">
            <div className="business-settings-logo-preview-container">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Vista previa del logo"
                  className="business-settings-logo-preview-image"
                />
              ) : (
                <span className="business-settings-logo-placeholder-text">
                  Sin Logo
                </span>
              )}
            </div>
            <div className="business-settings-logo-action-buttons">
              <label
                htmlFor="business-logo-file-input"
                className="business-settings-upload-button-label"
              >
                Subir Imagen
              </label>
              <input
                id="business-logo-file-input"
                type="file"
                accept="image/*"
                onChange={handleLogoImageUpload}
                className="business-settings-hidden-file-input"
              />
              <span className="business-settings-upload-hint-text">
                Recomendado: 500x500px
              </span>
            </div>
          </div>
        </div>

        {/* Name Field */}
        <div className="business-settings-form-field-group">
          <label htmlFor="businessName" className="business-settings-field-label">
            Nombre del Negocio
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={businessData.businessName}
            onChange={handleInputChange}
            className="business-settings-text-input"
            placeholder="Ej. Mi Empresa Web"
            required
          />
        </div>

        {/* Description Field */}
        <div className="business-settings-form-field-group">
          <label htmlFor="businessDescription" className="business-settings-field-label">
            Descripción
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            rows={4}
            value={businessData.businessDescription}
            onChange={handleInputChange}
            className="business-settings-textarea-input"
            placeholder="Añade una descripción sobre la actividad de tu empresa..."
          />
        </div>

        {/* Actions Section */}
        <div className="business-settings-form-action-wrapper">
          <button disabled={isUpdating} type="submit" className="business-settings-submit-button">
            {isUpdating ? "Guardando cambios..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}