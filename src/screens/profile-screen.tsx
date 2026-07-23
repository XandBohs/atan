import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { chooseAndUploadProfilePhoto, removeProfilePhoto } from '../data/profile-storage';
import {
  Button,
  colors,
  fontFamilies,
  Metric,
  SectionTitle,
  spacing,
  Surface,
  typography,
} from '../design-system';

export function ProfileScreen({ avatarUri, email, isWide, onAvatarChange, onLogout, userId }: { avatarUri: string | null; email: string; isWide: boolean; onAvatarChange: (uri: string | null) => void; onLogout: () => Promise<void>; userId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await onLogout();
  }

  async function choosePhoto() {
    setAvatarError('');
    setIsUploadingAvatar(true);
    try {
      const url = await chooseAndUploadProfilePhoto(userId);
      if (url) {
        onAvatarChange(url);
        setIsPhotoModalOpen(false);
      }
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Nao foi possivel atualizar sua foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function removePhoto() {
    setAvatarError('');
    setIsRemovingAvatar(true);
    try {
      await removeProfilePhoto(userId);
      onAvatarChange(null);
      setIsPhotoModalOpen(false);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Nao foi possivel retirar sua foto.');
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.profileHeader, isWide && styles.profileHeaderWide]}>
        <Pressable
          accessibilityHint="Abre as opcoes da foto de perfil"
          accessibilityLabel="Foto de perfil"
          accessibilityRole="button"
          onPress={() => setIsPhotoModalOpen(true)}
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
        >
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{email.slice(0, 2).toUpperCase()}</Text>}
        </Pressable>
        <View style={styles.profileIdentity}>
          <Text style={styles.kicker}>PERFIL PESSOAL</Text>
          <Text style={styles.profileName}>{email.split('@')[0] || 'Atleta'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
        <Button
          compact
          label={showSettings ? 'Fechar configurações' : 'Configurações'}
          onPress={() => setShowSettings((value) => !value)}
          variant="outline"
        />
      </View>

      {showSettings ? (
        <Surface style={styles.settingsPanel}>
          <Text style={styles.cardIndex}>CONFIGURAÇÕES</Text>
          <SettingRow label="Unidade de peso" value="Quilogramas (kg)" />
          <SettingRow label="Privacidade do perfil" value="Privado" />
          <SettingRow label="Sincronização" value="Ativa" />
          <Text style={styles.settingsNote}>
            Estas preferências representam o comportamento planejado para o MVP.
          </Text>
        </Surface>
      ) : (
        <>
          <Surface style={[styles.profileStats, isWide && styles.profileStatsWide]}>
            <Metric label="TREINOS" value="32" />
            <Metric label="TEMPO TOTAL" value="29H 18" />
            <Metric label="DESDE" value="MAI 2026" />
          </Surface>

          <SectionTitle title="Conquistas" />
          <View style={[styles.achievementGrid, isWide && styles.achievementGridWide]}>
            <Achievement exercise="Supino reto" label="MAIOR CARGA" value="80 kg" />
            <Achievement exercise="Agachamento livre" label="MELHOR SÉRIE" value="720 kg" />
          </View>
          <Text style={styles.disclaimer}>
            Conquistas de demonstração calculadas conforme as regras do MVP.
          </Text>
        </>
      )}

      <Button
        label={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        loading={isLoggingOut}
        onPress={logout}
        style={styles.logoutButton}
        variant="danger"
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsPhotoModalOpen(false)}
        transparent
        visible={isPhotoModalOpen}
      >
        <View style={styles.photoModal}>
          <BlurView intensity={72} style={StyleSheet.absoluteFill} tint="dark" />
          <Pressable accessibilityLabel="Fechar opcoes da foto" onPress={() => setIsPhotoModalOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={styles.photoModalContent}>
            <View style={styles.photoPreview}>
              {avatarUri ? <Image accessibilityLabel="Foto de perfil em destaque" source={{ uri: avatarUri }} style={styles.photoPreviewImage} /> : <Text style={styles.photoPreviewInitials}>{email.slice(0, 2).toUpperCase()}</Text>}
            </View>
            <View style={styles.photoModalActions}>
              <Button
                compact
                label={isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
                loading={isUploadingAvatar}
                onPress={choosePhoto}
                style={styles.photoModalAction}
                variant="primary"
              />
              <Button
                compact
                disabled={!avatarUri}
                label={isRemovingAvatar ? 'Retirando...' : 'Retirar foto'}
                loading={isRemovingAvatar}
                onPress={removePhoto}
                style={styles.photoModalAction}
                variant="danger"
              />
            </View>
            {avatarError ? <Text accessibilityRole="alert" style={styles.avatarError}>{avatarError}</Text> : null}
            <Text style={styles.photoModalHint}>Toque fora para fechar</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function Achievement({ exercise, label, value }: { exercise: string; label: string; value: string }) {
  return (
    <Surface style={styles.achievementCard}>
      <Text style={styles.cardIndex}>{label}</Text>
      <Text style={styles.achievementValue}>{value}</Text>
      <Text style={styles.achievementExercise}>{exercise}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  profileHeader: { gap: 18, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 28, marginBottom: 28 },
  profileHeaderWide: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, overflow: 'hidden' },
  avatarPressed: { opacity: 0.74, transform: [{ scale: 0.97 }] },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.onAccent, fontFamily: fontFamilies.mono, fontSize: 24, fontWeight: '700' },
  profileIdentity: { flex: 1 },
  kicker: { ...typography.caption, color: colors.accent, letterSpacing: 1.2, marginBottom: spacing.sm },
  profileName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 25, fontWeight: '700', letterSpacing: -0.8 },
  profileEmail: { ...typography.label, color: colors.textMuted, marginTop: 6 },
  avatarError: { ...typography.label, color: colors.danger, lineHeight: 16 },
  profileStats: { paddingHorizontal: 20, marginBottom: 30 },
  profileStatsWide: { flexDirection: 'row' },
  achievementGrid: { gap: spacing.sm, marginTop: 14 },
  achievementGridWide: { flexDirection: 'row' },
  achievementCard: { flex: 1, minHeight: 150, justifyContent: 'space-between', padding: 20 },
  cardIndex: { ...typography.overline, color: colors.accent },
  achievementValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 30, fontWeight: '700', letterSpacing: -1 },
  achievementExercise: { ...typography.caption, color: colors.textMuted },
  settingsPanel: { padding: 22, marginBottom: spacing.lg },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: { ...typography.label, flex: 1, color: colors.text },
  settingValue: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  settingsNote: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: 18 },
  disclaimer: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: spacing.md },
  logoutButton: { marginTop: 30 },
  photoModal: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11, 12, 10, 0.48)', padding: spacing.lg },
  photoModalContent: { width: '100%', maxWidth: 420, alignItems: 'center' },
  photoPreview: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, borderColor: colors.text, borderWidth: 1, overflow: 'hidden' },
  photoPreviewImage: { width: '100%', height: '100%' },
  photoPreviewInitials: { color: colors.onAccent, fontFamily: fontFamilies.mono, fontSize: 72, fontWeight: '700' },
  photoModalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, width: '100%' },
  photoModalAction: { flex: 1 },
  photoModalHint: { ...typography.overline, color: colors.textMuted, marginTop: spacing.md },
});

