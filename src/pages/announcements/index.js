import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import AnnouncementsTimeline from '../../components/announcements/AnnouncementsTimeline';
import { useAuth } from '../../context/AuthContext';

const AnnouncementsPage = ({ isAdmin = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcementsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || new Date();
          return {
            id: doc.id,
            ...data,
            timestamp,
            category: data.category || 'general',
            mediaUrls: data.mediaUrls || [],
            attachments: data.attachments || []
          };
        });
        setAnnouncements(announcementsData);
      }, (error) => {
        console.error("Error fetching announcements:", error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up announcements listener:", error);
    }
  }, []);

  const uploadMedia = async (files) => {
    const mediaUrls = [];
    const attachments = [];

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const isDocument = !isVideo && !isImage;

      const timestamp = Date.now();
      const fileName = `announcements/${user.uid}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        if (isVideo || isImage) {
          mediaUrls.push({
            url,
            type: isVideo ? 'video' : 'image',
            fileName
          });
        } else if (isDocument) {
          attachments.push({
            url,
            name: file.name,
            type: file.type,
            size: file.size,
            fileName
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    return { mediaUrls, attachments };
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { mediaUrls, attachments } = await uploadMedia(formData.files || []);

      const announcementData = {
        title: formData.title,
        content: formData.content,
        category: formData.category || 'general',
        timestamp: serverTimestamp(),
        createdBy: user.email,
        active: true,
        mediaUrls: mediaUrls,
        attachments: attachments,
        priority: formData.priority || 'normal',
        expiryDate: formData.expiryDate || null,
        tags: formData.tags || []
      };

      if (selectedAnnouncement) {
        // Delete old media files if they're being replaced
        if (selectedAnnouncement.mediaUrls) {
          for (const media of selectedAnnouncement.mediaUrls) {
            if (!formData.existingMedia?.includes(media.url)) {
              try {
                await deleteObject(ref(storage, media.fileName));
              } catch (error) {
                console.error('Error deleting old media:', error);
              }
            }
          }
        }

        const docRef = doc(db, 'announcements', selectedAnnouncement.id);
        await updateDoc(docRef, {
          ...announcementData,
          updatedAt: serverTimestamp(),
          mediaUrls: [...(formData.existingMedia || []), ...mediaUrls],
          attachments: [...(formData.existingAttachments || []), ...attachments]
        });
      } else {
        await addDoc(collection(db, 'announcements'), announcementData);
      }
      setIsFormOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || 'general',
      priority: announcement.priority || 'normal',
      expiryDate: announcement.expiryDate,
      tags: announcement.tags || [],
      mediaUrls: announcement.mediaUrls || [],
      attachments: announcement.attachments || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const announcement = announcements.find(a => a.id === announcementId);
        
        // Delete media files from storage
        if (announcement.mediaUrls) {
          for (const media of announcement.mediaUrls) {
            try {
              await deleteObject(ref(storage, media.fileName));
            } catch (error) {
              console.error('Error deleting media:', error);
            }
          }
        }

        // Delete attachments from storage
        if (announcement.attachments) {
          for (const attachment of announcement.attachments) {
            try {
              await deleteObject(ref(storage, attachment.fileName));
            } catch (error) {
              console.error('Error deleting attachment:', error);
            }
          }
        }

        // Delete the announcement document
        const docRef = doc(db, 'announcements', announcementId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage company announcements' : 'Stay updated with company announcements'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedAnnouncement(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>New Announcement</span>
            </button>
          )}
        </div>

        {isFormOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <AnnouncementForm
                initialData={selectedAnnouncement}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedAnnouncement(null);
                }}
                loading={loading}
              />
            </motion.div>
          </div>
        )}

        <AnnouncementsTimeline
          announcements={announcements}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsPage; 
