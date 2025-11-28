// client/lib/src/utils/crypto.ts

import { getApiConfig } from "../config/api.config";

/**
 * RSA加密工具
 * 用于加密敏感数据（如密码）传输
 */

/**
 * 将Base64字符串转换为ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * 将ArrayBuffer转换为Base64字符串
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * 从Base64编码的公钥字符串导入RSA公钥
 */
async function importPublicKey(base64PublicKey: string): Promise<CryptoKey> {
    const binaryKey = base64ToArrayBuffer(base64PublicKey);

    return await crypto.subtle.importKey(
        'spki',
        binaryKey,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        false,
        ['encrypt']
    );
}

/**
 * 使用RSA公钥加密数据
 * @param data 要加密的明文数据
 * @param base64PublicKey Base64编码的RSA公钥
 * @returns Base64编码的加密数据
 */
export async function rsaEncrypt(data: string, base64PublicKey: string): Promise<string> {
    try {
        // 导入公钥
        const publicKey = await importPublicKey(base64PublicKey);

        // 将字符串转换为字节数组
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);

        // 加密数据
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'RSA-OAEP',
            },
            publicKey,
            dataBytes
        );

        // 转换为Base64字符串
        return arrayBufferToBase64(encryptedData);
    } catch (error) {
        console.error('RSA加密失败:', error);
        throw new Error('数据加密失败');
    }
}

/**
 * 缓存公钥
 */
let cachedPublicKey: string | null = null;

/**
 * 获取服务器的RSA公钥
 * @param apiBaseUrl API基础URL
 * @returns Base64编码的RSA公钥
 */
export async function getPublicKey(): Promise<string> {
    if (cachedPublicKey) {
        return cachedPublicKey;
    }

    try {
        const fetchImpl = getApiConfig().customFetch || fetch;
        const response = await fetchImpl(getApiConfig().baseURL + '/api/security/public-key', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`获取公钥失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // 解包 ApiResponse 格式: { success: true, data: "公钥", message: "..." }
        if (result.success && result.data) {
            cachedPublicKey = result.data;
            return result.data;
        } else {
            throw new Error('公钥数据为空或格式错误');
        }
    } catch (error) {
        console.error('获取公钥失败:', error);
        throw new Error('获取公钥失败');
    }
}

/**
 * 清除缓存的公钥
 */
export function clearCachedPublicKey(): void {
    cachedPublicKey = null;
}
