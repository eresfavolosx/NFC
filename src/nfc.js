/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — NFC Integration (Web & Native)
   ═══════════════════════════════════════════════════════════ */

import { Capacitor } from '@capacitor/core';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { Haptics, NotificationType } from '@capacitor/haptics';

const NDEF_URI_PREFIXES = [
    '', 'http://www.', 'https://www.', 'http://', 'https://',
    'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.',
    'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://',
    'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://',
    'urn:', 'pop:', 'sip:', 'sips:', 'tftp:',
    'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://',
    'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:',
    'urn:epc:raw:', 'urn:nfc:wkt:', 'urn:nfc:ext:'
];

const NATIVE_NFC_TIMEOUT_MS = 30000;

export const nfc = {
    _deps: { Capacitor, CapacitorNfc, Haptics },

    isNative() {
        return this._deps.Capacitor.isNativePlatform();
    },

    async isSupported() {
        if (this.isNative()) {
            try {
                const { supported } = await this._deps.CapacitorNfc.isSupported();
                return supported;
            } catch {
                return false;
            }
        }
        return typeof window !== 'undefined' && 'NDEFReader' in window;
    },

    isIOS() {
        if (this.isNative()) return this._deps.Capacitor.getPlatform() === 'ios';
        if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    async writeTag(url, options = {}) {
        if (this.isNative()) {
            return this._writeTagNative(url, options);
        }

        if (typeof window === 'undefined' || !('NDEFReader' in window)) {
            throw new Error('Web NFC is not supported in this browser. Please use Chrome on Android.');
        }

        try {
            const ndef = new window.NDEFReader();
            await ndef.write({
                records: [
                    { recordType: 'url', data: url },
                ],
            });
            return { success: true, url };
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                throw new Error('NFC permission was denied. Please allow NFC access.');
            }
            if (err.name === 'NotReadableError') {
                throw new Error('Could not read the NFC tag. Make sure the tag is close enough.');
            }
            throw new Error(`Failed to write NFC tag: ${err.message}`);
        }
    },

    async _runNativeNfcSession(alertMessage, timeoutMessage, onTagEvent) {
        const { CapacitorNfc: nfcPlugin } = this._deps;
        let listenerHandle = null;
        let timeoutId = null;
        let settled = false;

        const cleanup = async () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (listenerHandle) {
                const handle = listenerHandle;
                listenerHandle = null;
                try {
                    await handle.remove();
                } catch {
                    // Ignore listener cleanup errors
                }
            }
            try {
                await nfcPlugin.stopScanning();
            } catch {
                // Ignore stopScanning cleanup errors
            }
        };

        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    listenerHandle = await nfcPlugin.addListener('nfcEvent', async (event) => {
                        if (settled) return;
                        settled = true;
                        try {
                            const result = await onTagEvent(event);
                            await cleanup();
                            resolve(result);
                        } catch (err) {
                            await cleanup();
                            reject(err);
                        }
                    });

                    if (settled) {
                        await cleanup();
                        return;
                    }

                    timeoutId = setTimeout(async () => {
                        if (settled) return;
                        settled = true;
                        await cleanup();
                        reject(new Error(timeoutMessage));
                    }, NATIVE_NFC_TIMEOUT_MS);

                    await nfcPlugin.startScanning({
                        alertMessage,
                        invalidateAfterFirstRead: true
                    });
                } catch (err) {
                    if (!settled) {
                        settled = true;
                        await cleanup();
                        reject(err);
                    }
                }
            })();
        });
    },

    async _writeTagNative(url, options = {}) {
        const { Capacitor: cap, CapacitorNfc: nfcPlugin, Haptics: haptics } = this._deps;
        try {
            return await this._runNativeNfcSession(
                'Hold your NFC tag near the phone to write.',
                'NFC write timed out.',
                async () => {
                    try {
                        const record = this._createUrlRecord(url);
                        await nfcPlugin.write({ records: [record] });

                        if (options.lock) {
                            await nfcPlugin.makeReadOnly();
                        }

                        if (cap.isNativePlatform()) {
                            await haptics.notification({ type: NotificationType.Success }).catch(() => {});
                        }

                        return { success: true, url };
                    } catch (err) {
                        if (cap.isNativePlatform()) {
                            await haptics.notification({ type: NotificationType.Error }).catch(() => {});
                        }
                        throw err;
                    }
                }
            );
        } catch (err) {
            throw new Error(`Native NFC write failed: ${err.message}`);
        }
    },

    _createUrlRecord(url) {
        let prefixIndex = 0;
        let urlWithoutPrefix = url;

        for (let i = 1; i < NDEF_URI_PREFIXES.length; i++) {
            if (url.startsWith(NDEF_URI_PREFIXES[i])) {
                prefixIndex = i;
                urlWithoutPrefix = url.substring(NDEF_URI_PREFIXES[i].length);
                break;
            }
        }

        const encoder = new TextEncoder();
        const urlBytes = encoder.encode(urlWithoutPrefix);
        const payload = [prefixIndex, ...urlBytes];

        return {
            tnf: 1, // NFC Forum Well Known Type
            type: [85], // 'U'
            id: [],
            payload: payload
        };
    },

    async readTag() {
        if (this.isNative()) {
            return this._readTagNative();
        }

        if (typeof window === 'undefined' || !('NDEFReader' in window)) {
            throw new Error('Web NFC is not supported in this browser. Please use Chrome on Android.');
        }

        return new Promise((resolve, reject) => {
            const ndef = new window.NDEFReader();
            const ac = new AbortController();

            const timeout = setTimeout(() => {
                ac.abort();
                reject(new Error('NFC scan timed out. Please try again.'));
            }, NATIVE_NFC_TIMEOUT_MS);

            ndef.scan({ signal: ac.signal }).then(() => {
                ndef.addEventListener('reading', ({ serialNumber, message }) => {
                    clearTimeout(timeout);
                    ac.abort();

                    let url = null;
                    for (const record of message.records) {
                        if (record.recordType === 'url') {
                            const decoder = new TextDecoder();
                            url = decoder.decode(record.data);
                            break;
                        }
                    }

                    resolve({ serialNumber, url, records: message.records });
                });

                ndef.addEventListener('readingerror', () => {
                    clearTimeout(timeout);
                    ac.abort();
                    reject(new Error('Error reading NFC tag. Please try again.'));
                });
            }).catch(err => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    },

    async _readTagNative() {
        try {
            return await this._runNativeNfcSession(
                'Hold your NFC tag near the phone to read.',
                'NFC read timed out.',
                async (event) => {
                    const tag = event?.tag || {};
                    let url = null;

                    if (tag.ndefMessage) {
                        for (const record of tag.ndefMessage) {
                            if (record.type?.length === 1 && record.type[0] === 85) { // 'U'
                                const prefixIndex = record.payload[0];
                                const prefix = NDEF_URI_PREFIXES[prefixIndex] || '';
                                const payloadData = record.payload.slice(1);
                                const decoder = new TextDecoder();
                                url = prefix + decoder.decode(new Uint8Array(payloadData));
                                break;
                            }
                        }
                    }

                    return {
                        serialNumber: tag.id ? tag.id.map(b => b.toString(16).padStart(2, '0')).join(':') : null,
                        url,
                        records: tag.ndefMessage
                    };
                }
            );
        } catch (err) {
            throw new Error(`Native NFC read failed: ${err.message}`);
        }
    },

    async getCompatibilityInfo() {
        const supported = await this.isSupported();
        const native = this.isNative();

        if (supported) {
            return {
                supported: true,
                message: null,
                platform: native ? 'native' : 'web',
                canWriteOnIOS: native && this.isIOS()
            };
        }

        if (this.isIOS() && !native) {
            return {
                supported: false,
                platform: 'ios-web',
                canRead: true,
                message: 'iPhones can read NFC tags natively. To write tags, use Chrome on Android or the native app.',
                readNote: 'Your iPhone reads NDEF tags automatically. To enable writing, run this app as a native iOS application.',
            };
        }

        const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
        if (/firefox|safari/.test(ua) && !/chrome/.test(ua)) {
            return {
                supported: false,
                platform: 'unsupported-browser',
                canRead: false,
                message: 'Web NFC is only supported in Chrome on Android. Please switch to Chrome.',
            };
        }

        if (/android/.test(ua)) {
            return {
                supported: false,
                platform: 'android-other',
                canRead: false,
                message: 'Please make sure you are using Chrome 89+ and NFC is enabled on your device.',
            };
        }

        return {
            supported: false,
            platform: 'desktop',
            canRead: false,
            message: 'Web NFC requires Chrome on an Android device. The admin console works on any browser.',
        };
    },

    async getCompatibilityMessage() {
        const info = await this.getCompatibilityInfo();
        return info.message;
    },

    async getNativeBiometric() {
        if (!this.isNative()) return null;
        try {
            const mod = await import('@capgo/capacitor-native-biometric');
            return mod.NativeBiometric || null;
        } catch {
            return null;
        }
    },

    // ── Biometrics ──
    async isBiometricAvailable() {
        if (!this.isNative()) return false;
        try {
            const plugin = await this.getNativeBiometric();
            if (!plugin) return false;
            const result = await plugin.isAvailable();
            return Boolean(result?.isAvailable);
        } catch {
            return false;
        }
    },

    async authenticateWithBiometrics() {
        if (!this.isNative()) return false;
        try {
            const plugin = await this.getNativeBiometric();
            if (!plugin) return false;
            await plugin.verifyIdentity({
                reason: "Unlock NFC Tag Manager",
                title: "Authentication Required",
                subtitle: "Use FaceID/TouchID to access admin settings",
                description: "This ensures only you can manage tags."
            });
            return true;
        } catch (e) {
            console.error('Biometric Auth failed:', e);
            return false;
        }
    }
};
