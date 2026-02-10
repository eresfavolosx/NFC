/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Web NFC Integration
   ═══════════════════════════════════════════════════════════ */

export const nfc = {
    isSupported() {
        return 'NDEFReader' in window;
    },

    isIOS() {
        const ua = navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(ua) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },

    isAndroid() {
        return /android/i.test(navigator.userAgent);
    },

    async writeTag(url) {
        if (!this.isSupported()) {
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

    async readTag() {
        if (!this.isSupported()) {
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

    getCompatibilityInfo() {
        if (this.isSupported()) {
            return { supported: true, message: null, platform: 'android-chrome' };
        }

        if (this.isIOS()) {
            return {
                supported: false,
                platform: 'ios',
                canRead: true,
                message: 'iPhones can read NFC tags natively — just tap the tag to open the link. To write tags, use Chrome on an Android device.',
                readNote: 'Your iPhone reads NDEF tags automatically. When the screen is on, just hold the tag near the top of your iPhone.',
            };
        }

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
};
