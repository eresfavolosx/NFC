/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — NFC Integration (Web & Native)
   ═══════════════════════════════════════════════════════════ */

import { Capacitor } from '@capacitor/core';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';

import { NativeBiometric } from 'capacitor-native-biometric';

export const nfc = {
    isNative() {
        return Capacitor.isNativePlatform();
    },

    async isSupported() {
        if (this.isNative()) {
            try {
                const { supported } = await CapacitorNfc.isSupported();
                return supported;
            } catch {
                return false;
            }
        }
        return 'NDEFReader' in window;
    },

    isIOS() {
        if (this.isNative()) return Capacitor.getPlatform() === 'ios';
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    async writeTag(url, options = {}) {
        if (this.isNative()) {
            return this._writeTagNative(url, options);
        }

        if (!('NDEFReader' in window)) {
            throw new Error('Web NFC is not supported in this browser. Please use Chrome on Android.');
        }

        try {
            const ndef = new NDEFReader();
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

    async _writeTagNative(url) {
        try {
            // 1. Start scanning (shows system sheet on iOS)
            await CapacitorNfc.startScanning({
                alertMessage: 'Hold your NFC tag near the phone to write.',
                invalidateAfterFirstRead: true
            });

            // 2. Wait for a tag to be discovered
            return new Promise((resolve, reject) => {
                const listener = CapacitorNfc.addListener('nfcEvent', async (event) => {
                    try {
                        // Found a tag! Now write.
                        const record = this._createUrlRecord(url);
                        await CapacitorNfc.write({ records: [record] });
                        
                        // Handle Locking
                        if (options.lock) {
                            await CapacitorNfc.makeReadOnly();
                        }

                        // Success haptics
                        if (Capacitor.isNativePlatform()) {
                            await Haptics.notification({ type: NotificationType.Success });
                        }

                        listener.remove();
                        await CapacitorNfc.stopScanning();
                        resolve({ success: true, url });
                    } catch (err) {
                        if (Capacitor.isNativePlatform()) {
                            await Haptics.notification({ type: NotificationType.Error });
                        }
                        listener.remove();
                        await CapacitorNfc.stopScanning();
                        reject(err);
                    }
                });

                // Timeout
                setTimeout(async () => {
                    listener.remove();
                    await CapacitorNfc.stopScanning();
                    reject(new Error('NFC write timed out.'));
                }, 30000);
            });
        } catch (err) {
            throw new Error(`Native NFC write failed: ${err.message}`);
        }
    },

    _createUrlRecord(url) {
        const prefixes = [
            '', 'http://www.', 'https://www.', 'http://', 'https://',
            'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.',
            'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://',
            'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://',
            'urn:', 'pop:', 'sip:', 'sips:', 'tftp:',
            'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://',
            'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:',
            'urn:epc:raw:', 'urn:nfc:wkt:', 'urn:nfc:ext:'
        ];

        let prefixIndex = 0;
        let urlWithoutPrefix = url;

        for (let i = 1; i < prefixes.length; i++) {
            if (url.startsWith(prefixes[i])) {
                prefixIndex = i;
                urlWithoutPrefix = url.substring(prefixes[i].length);
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

        if (!('NDEFReader' in window)) {
            throw new Error('Web NFC is not supported in this browser. Please use Chrome on Android.');
        }

        return new Promise((resolve, reject) => {
            const ndef = new NDEFReader();
            const ac = new AbortController();

            const timeout = setTimeout(() => {
                ac.abort();
                reject(new Error('NFC scan timed out. Please try again.'));
            }, 30000);

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
            await CapacitorNfc.startScanning({
                alertMessage: 'Hold your NFC tag near the phone to read.',
                invalidateAfterFirstRead: true
            });

            return new Promise((resolve, reject) => {
                const listener = CapacitorNfc.addListener('nfcEvent', async (event) => {
                    listener.remove();
                    await CapacitorNfc.stopScanning();

                    const tag = event.tag;
                    let url = null;

                    if (tag.ndefMessage) {
                        for (const record of tag.ndefMessage) {
                            if (record.type.length === 1 && record.type[0] === 85) { // 'U'
                                const prefixIndex = record.payload[0];
                                const prefixes = ['', 'http://www.', 'https://www.', 'http://', 'https://', 'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.', 'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://', 'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:', 'sip:', 'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:nfc:wkt:', 'urn:nfc:ext:'];
                                const prefix = prefixes[prefixIndex] || '';
                                const payloadData = record.payload.slice(1);
                                const decoder = new TextDecoder();
                                url = prefix + decoder.decode(new Uint8Array(payloadData));
                                break;
                            }
                        }
                    }

                    resolve({
                        serialNumber: tag.id ? tag.id.map(b => b.toString(16).padStart(2, '0')).join(':') : null,
                        url,
                        records: tag.ndefMessage
                    });
                });

                setTimeout(async () => {
                    listener.remove();
                    await CapacitorNfc.stopScanning();
                    reject(new Error('NFC read timed out.'));
                }, 30000);
            });
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
        // ... rest stays similar

        const ua = navigator.userAgent.toLowerCase();
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

    // Legacy compat
    getCompatibilityMessage() {
        return this.getCompatibilityInfo().message;
    },

    // ── Biometrics ──
    async isBiometricAvailable() {
        if (!this.isNative()) return false;
        try {
            const result = await NativeBiometric.isAvailable();
            return result.isAvailable;
        } catch {
            return false;
        }
    },

    async authenticateWithBiometrics() {
        if (!this.isNative()) return false;
        try {
            await NativeBiometric.verifyIdentity({
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
