
"use client";
import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import ImageUpload from "./ImageUpload";
import { Button } from "./ui/button";
import { InputWithLabel } from "./inputs/InputWithLabel";
import { SchoolType } from "../types/SchoolType"; // Adjust the import path as necessary"

interface EditSchoolFormProps {
  formData: SchoolType;
  setFormData: React.Dispatch<React.SetStateAction<SchoolType>>;
  isEditing: boolean;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCloseModal: () => void;
}

const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
  formData,
  setFormData,
  isEditing,
  handleFormSubmit,
  handleCloseModal,
}) => {
  const methods = useForm<SchoolType>({ defaultValues: formData });
  const { watch, setValue } = methods;

  // Sync form state with `setFormData`
  useEffect(() => {
    const subscription = watch((updatedData) => {
      setFormData({
        ...updatedData,
        establishment_name: updatedData.establishment_name || "",
        street: updatedData.street || "",
        locality: updatedData.locality || "",
        address3: updatedData.address3 || "",
        town: updatedData.town || "",
        establishment_type_group: updatedData.establishment_type_group || "",
        id: updatedData.id || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  // const onSubmit = async (data: SchoolType) => {
  //   console.log("Form submitted:", data);
  //   setFormData(data); // Ensure the latest data is saved
    
  //   handleCloseModal(); // Close the modal after submission
  // };

  const handleImageChange = (imageUrl: string | null) => {
    setValue("featured_image", imageUrl || ""); // Update react-hook-form
    setFormData((prev) => ({ ...prev, featured_image: imageUrl || "" })); // Sync local state
  };

  return (
    <FormProvider {...methods}>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-labelledby="edit-school-form-title"
        aria-modal="true"
      >
        <div className="bg-white shadow-md rounded-lg p-6 w-[400px]">
          <h4 id="edit-school-form-title" className="text-lg font-bold mb-4">
            {isEditing ? "Edit" : "Add"} School
          </h4>
          <form onSubmit={handleFormSubmit}>
            <ImageUpload
              listingImage={formData.featured_image}
              preset="nextSchools"
              onImageChange={handleImageChange}
            />
            <InputWithLabel fieldTitle="Name" nameInSchema="establishment_name" placeholder="Name" required />
            <InputWithLabel fieldTitle="Street" nameInSchema="street" placeholder="Street" />
            <InputWithLabel fieldTitle="Locality" nameInSchema="locality" placeholder="Locality" />
            <InputWithLabel fieldTitle="Address Line 3" nameInSchema="address3" placeholder="Address Line 3" />
            <InputWithLabel fieldTitle="Town" nameInSchema="town" placeholder="Town" />
            <InputWithLabel fieldTitle="Establishment Type Group" nameInSchema="establishment_type_group" placeholder="Establishment Type Group" />
            <div className="flex justify-between mt-6">
              <Button type="submit">{isEditing ? "Update" : "Add"} School</Button>
              <Button className="primary" type="button" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default EditSchoolForm;
