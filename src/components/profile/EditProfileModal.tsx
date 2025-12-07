"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Alert from "@/components/common/Alert";
import { profileApi, UserProfile, ProfileUpdateRequest } from "@/api/profile";
import { feetInchesToInches, inchesToFeetInches } from "@/lib/utils";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const heightData = inchesToFeetInches(user?.height);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    birthday: user?.birthday || "",
    heightFeet: heightData.feet,
    heightInches: heightData.inches,
    weight: user?.weight?.toString() || "",
    hometownCity: user?.hometownCity || "",
    hometownState: user?.hometownState || "",
    hometownCountry: user?.hometownCountry || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when user prop changes
  useEffect(() => {
    if (user) {
      const heightData = inchesToFeetInches(user.height);
      
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthday: user.birthday || "",
        heightFeet: heightData.feet,
        heightInches: heightData.inches,
        weight: user.weight?.toString() || "",
        hometownCity: user.hometownCity || "",
        hometownState: user.hometownState || "",
        hometownCountry: user.hometownCountry || "",
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const updateRequest: ProfileUpdateRequest = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        birthday: formData.birthday || null,
        height: feetInchesToInches(formData.heightFeet, formData.heightInches),
        weight: formData.weight ? parseInt(formData.weight) : null,
        hometownCity: formData.hometownCity || null,
        hometownState: formData.hometownState || null,
        hometownCountry: formData.hometownCountry || null,
      };

      await profileApi.updateProfile(updateRequest);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      size="lg"
      showFooter
      confirmText="Save Changes"
      cancelText="Cancel"
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isSubmitting}
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="First name"
            required
            minLength={2}
            maxLength={30}
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Last name"
            required
            minLength={2}
            maxLength={30}
          />
        </div>

        <Input
          label="Birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) =>
            setFormData({ ...formData, birthday: e.target.value })
          }
        />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Height - feet"
              type="number"
              value={formData.heightFeet}
              onChange={(e) =>
                setFormData({ ...formData, heightFeet: e.target.value })
              }
              placeholder="e.g., 6"
              min={0}
              max={8}
            />
            <Input
              label="Height - inches"
              type="number"
              value={formData.heightInches}
              onChange={(e) =>
                setFormData({ ...formData, heightInches: e.target.value })
              }
              placeholder="e.g., 0"
              min={0}
              max={11}
            />
          </div>
          <Input
            label="Weight - lbs"
            type="number"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            placeholder="e.g., 180"
            min={0}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Hometown City"
            value={formData.hometownCity}
            onChange={(e) =>
              setFormData({ ...formData, hometownCity: e.target.value })
            }
            placeholder="e.g., Los Angeles"
            maxLength={100}
          />
          <Input
            label="Hometown State"
            value={formData.hometownState}
            onChange={(e) =>
              setFormData({ ...formData, hometownState: e.target.value })
            }
            placeholder="e.g., California"
            maxLength={100}
          />
          <Input
            label="Hometown Country"
            value={formData.hometownCountry}
            onChange={(e) =>
              setFormData({ ...formData, hometownCountry: e.target.value })
            }
            placeholder="e.g., United States"
            maxLength={100}
          />
        </div>

      </div>
    </Modal>
  );
}
