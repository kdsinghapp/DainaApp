import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import font from "../theme/font";
import { color } from "../constant";

const RATING_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void | Promise<void>;
  isSubmitting?: boolean;
  title?: string;
  subtitle?: string;
}

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  title = "Rate your delivery",
  subtitle = "How was your experience?",
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit(rating, comment);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>⭐</Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.starsSection}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starTouch}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      style={[
                        styles.starIcon,
                        rating >= star ? styles.starIconFilled : styles.starIconEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingLabel}>{RATING_LABELS[rating - 1]}</Text>
              )}
            </View>

            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience (optional)"
                placeholderTextColor="#94A3B8"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{comment.length}/200</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  rating < 1 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={rating < 1 || isSubmitting}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    rating < 1 && styles.submitButtonTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFF",
    zIndex: 1,
    borderRadius: 24,
    padding: 28,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 16 },
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
    }),
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: font.MonolithRegular,
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: font.MonolithRegular,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  starsSection: {
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  starTouch: {
    padding: 8,
  },
  starIcon: {
    fontSize: 42,
    fontFamily: font.MonolithRegular,
  },
  starIconFilled: {
    color: color.baground,
    fontFamily: font.MonolithRegular,

  },
  starIconEmpty: {
    color: "#E2E8F0",
    fontFamily: font.MonolithRegular,

  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: font.MonolithRegular,
    color: color.baground,
    textAlign: "center",
    marginTop: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 14,
    fontSize: 15,
    fontFamily: font.MonolithRegular,
    color: "#0F172A",
    minHeight: 96,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
  },
  charCount: {
    fontSize: 11,
    fontFamily: font.MonolithRegular,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 6,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: font.TrialDemiBold,
    color: "#64748B",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: color.baground,
    alignItems: "center",

  },
  submitButtonDisabled: {
    backgroundColor: "#E2E8F0",

  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#FFF",
  },
  submitButtonTextDisabled: {
    color: "#94A3B8",
    fontFamily: font.MonolithRegular,

  },
});

export default memo(RatingModal);
