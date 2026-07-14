<?php

namespace App\Services;

/**
 * Minimal, dependency-free TOTP (RFC 6238) implementation used for the
 * optional two-factor authentication flow. Compatible with Google
 * Authenticator / Authy (SHA1, 6 digits, 30s period).
 */
class TwoFactorService
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public function generateSecret(int $length = 20): string
    {
        $bytes = random_bytes($length);

        return $this->base32Encode($bytes);
    }

    public function otpauthUrl(string $issuer, string $account, string $secret): string
    {
        $label = rawurlencode($issuer).':'.rawurlencode($account);
        $query = http_build_query([
            'secret' => $secret,
            'issuer' => $issuer,
            'algorithm' => 'SHA1',
            'digits' => 6,
            'period' => 30,
        ]);

        return "otpauth://totp/{$label}?{$query}";
    }

    /** Verify a user-supplied code, tolerating +/- one time window for clock drift. */
    public function verify(string $secret, string $code, int $window = 1): bool
    {
        $code = trim($code);
        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $timeSlice = (int) floor(time() / 30);

        for ($i = -$window; $i <= $window; $i++) {
            if (hash_equals($this->codeAt($secret, $timeSlice + $i), $code)) {
                return true;
            }
        }

        return false;
    }

    public function codeAt(string $secret, int $timeSlice): string
    {
        $key = $this->base32Decode($secret);
        $binary = pack('N*', 0).pack('N*', $timeSlice);
        $hash = hash_hmac('sha1', $binary, $key, true);
        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;

        $part = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        ) % 1_000_000;

        return str_pad((string) $part, 6, '0', STR_PAD_LEFT);
    }

    public function recoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => strtoupper(bin2hex(random_bytes(5))))
            ->all();
    }

    private function base32Encode(string $data): string
    {
        $binary = '';
        foreach (str_split($data) as $char) {
            $binary .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
        }

        $result = '';
        foreach (str_split($binary, 5) as $chunk) {
            $result .= self::ALPHABET[bindec(str_pad($chunk, 5, '0', STR_PAD_RIGHT))];
        }

        return $result;
    }

    private function base32Decode(string $secret): string
    {
        $secret = rtrim(strtoupper($secret), '=');
        $binary = '';
        foreach (str_split($secret) as $char) {
            $index = strpos(self::ALPHABET, $char);
            if ($index === false) {
                continue;
            }
            $binary .= str_pad(decbin($index), 5, '0', STR_PAD_LEFT);
        }

        $bytes = '';
        foreach (str_split($binary, 8) as $chunk) {
            if (strlen($chunk) === 8) {
                $bytes .= chr(bindec($chunk));
            }
        }

        return $bytes;
    }
}
