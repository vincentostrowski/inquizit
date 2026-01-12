import { View, Text, StyleSheet, Image } from "react-native";
import ExpertSection from "./ExpertSection";
import CardsLearnedSection from "./CardsLearnedSection";
import ConsistencySection from "./ConsistencySection";
import ActivitySection from "./ActivitySection";
import { supabase } from "../../services/supabaseClient";

interface Profile {
  id: string;
  username: string | null;
  profile_picture_path: string | null;
  updated_at?: string;
}

interface ProfileContentProps {
  userId: string;
  profile: Profile | null;
  loading?: boolean;
  onBookPress?: (bookId: number) => void;
}

const getInitials = (username: string | null | undefined) => {
  if (!username) return "?";
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
};

export default function ProfileContent({
  userId,
  profile,
  loading = false,
  onBookPress,
}: ProfileContentProps) {
  // Show loading or empty state if needed
  if (loading || !profile) {
    return null; // Let parent handle loading/error states
  }

  return (
    <>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          {profile?.profile_picture_path ? (
            <Image
              source={{
                uri: `${supabase.storage
                  .from("profile-pictures")
                  .getPublicUrl(profile.profile_picture_path).data
                  .publicUrl}?v=${profile.updated_at || Date.now()}`,
              }}
              style={styles.avatar}
              key={`${profile.id}-${profile.profile_picture_path}`}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {getInitials(profile?.username)}
              </Text>
            </View>
          )}
        </View>

        {/* Username */}
        <Text style={styles.username}>
          {profile?.username || "No username"}
        </Text>
      </View>

      {/* Cards Learned Section */}
      <CardsLearnedSection userId={userId} />

      {/* Expert Section */}
      <ExpertSection
        userId={userId}
        onBookPress={
          onBookPress ||
          ((bookId) => {
            // TODO: Navigate to book details
            console.log("Navigate to book:", bookId);
          })
        }
      />

      {/* Consistency Section */}
      <ConsistencySection userId={userId} />

      {/* Activity Section */}
      <ActivitySection userId={userId} />
    </>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E5E5EA",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E5E5EA",
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
  },
});

