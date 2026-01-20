import { useState, useEffect, useRef } from 'react';
import apiClient from '../utils/apiClient';

// Speaker cache: { [speakerId]: speakerData }
const speakerCache = new Map();

/**
 * useSessionData Hook
 * Hybrid approach: Cache speakers (static), Fresh fetch session status (dynamic)
 */
export const useSessionData = (masterclassId) => {
  const [sessionData, setSessionData] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null); // 'CONFIRMED', 'WAITLISTED', null
  const [waitlistPosition, setWaitlistPosition] = useState(null);
  const refreshIntervalRef = useRef(null);

  // Fetch full session details (includes speakers)
  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get full session data
      const response = await apiClient.get(
        `/masterclasses/${masterclassId}`
      );

      const payload = response?.data?.data || response?.data;
      setSessionData(payload);

      // Process speakers: fetch from cache or API
      const speakerIds = Array.isArray(payload?.speakerIds)
        ? payload.speakerIds
        : (payload?.speakerId ? [payload.speakerId] : []);

      if (speakerIds && speakerIds.length > 0) {
        const speakersToFetch = [];
        const speakersData = [];

        for (const speakerId of speakerIds) {
          if (speakerCache.has(speakerId)) {
            // Use cached speaker
            speakersData.push(speakerCache.get(speakerId));
          } else {
            // Mark for fetching
            speakersToFetch.push(speakerId);
          }
        }

        // Fetch missing speakers
        if (speakersToFetch.length > 0) {
          try {
            const speakersResponse = await apiClient.post(
              `/speakers/batch`,
              { speakerIds: speakersToFetch }
            );

            // Cache and add to results
            const list = speakersResponse?.data?.data || speakersResponse?.data || [];
            list.forEach((speaker) => {
              speakerCache.set(speaker.id, speaker);
              speakersData.push(speaker);
            });
          } catch (speakerErr) {
            console.warn('Failed to fetch speaker details:', speakerErr);
          }
        }

        setSpeakers(speakersData);
      }
    } catch (err) {
      console.error('Error fetching session data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lightweight fresh fetch for real-time status
  const fetchSessionStatus = async () => {
    try {
      const response = await apiClient.get(
        `/masterclasses/${masterclassId}/status${window?.localStorage?.getItem('userEmail') ? `?email=${encodeURIComponent(window.localStorage.getItem('userEmail'))}` : ''}`
      );

      const payload = response?.data?.data || response?.data;

      // Update only the dynamic fields
      setSessionData((prev) => ({
        ...prev,
        bookedCount: payload.bookedCount,
        capacity: payload.capacity,
        status: payload.status,
      }));

      setRegistrationStatus(payload.registrationStatus || null);
      setWaitlistPosition(payload.waitlistPosition || null);
    } catch (err) {
      console.error('Error fetching session status:', err);
    }
  };

  // Initial load on mount
  useEffect(() => {
    if (masterclassId) {
      fetchSessionData();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [masterclassId]);

  // Poll for fresh status every 30 seconds
  useEffect(() => {
    if (masterclassId && !loading) {
      // Initial refresh
      fetchSessionStatus();

      // Set interval for continuous polling
      refreshIntervalRef.current = setInterval(() => {
        fetchSessionStatus();
      }, 30000); // Poll every 30 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [masterclassId, loading]);

  // Refocus listener: fetch fresh data when tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchSessionStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [masterclassId]);

  return {
    sessionData,
    speakers,
    loading,
    error,
    registrationStatus,
    waitlistPosition,
    refetchStatus: fetchSessionStatus,
  };
};

export default useSessionData;
