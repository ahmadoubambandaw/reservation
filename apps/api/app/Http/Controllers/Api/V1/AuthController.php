<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\RestaurantResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\RestaurantProvisioner;
use App\Services\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected TwoFactorService $twoFactor,
    ) {}

    /** Register a restaurant owner and bootstrap their tenant. */
    public function register(RegisterRequest $request, RestaurantProvisioner $provisioner): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
        ]);

        $restaurant = $provisioner->provision($user, $request->restaurant_name, $request->plan);

        $token = $user->createToken($request->input('device_name', 'web'))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
            'restaurant' => new RestaurantResource($restaurant->load('subscription.plan')),
        ], 201);
    }

    /** Password-based login, with optional TOTP second factor. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        if ($user->two_factor_confirmed_at) {
            $code = $request->input('two_factor_code');

            if (! $code) {
                return response()->json([
                    'two_factor_required' => true,
                    'message' => 'Code de vérification à deux facteurs requis.',
                ], 202);
            }

            $secret = Crypt::decryptString($user->two_factor_secret);

            if (! $this->twoFactor->verify($secret, $code)) {
                throw ValidationException::withMessages([
                    'two_factor_code' => ['Code de vérification invalide.'],
                ]);
            }
        }

        $token = $user->createToken($request->input('device_name', 'web'))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    /** Current user + their restaurant memberships and effective permissions. */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employeeFor();

        return response()->json([
            'user' => new UserResource($user),
            'restaurant' => $employee
                ? new RestaurantResource($employee->restaurant->load('subscription.plan'))
                : null,
            'role' => $employee?->role?->slug ?? ($user->isSuperAdmin() ? 'super_admin' : null),
            'permissions' => $employee?->role?->permissions->pluck('slug') ?? [],
            'restaurants' => RestaurantResource::collection($user->restaurants),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    // --- Two-factor authentication ------------------------------------

    public function enableTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = $this->twoFactor->generateSecret();
        $recovery = $this->twoFactor->recoveryCodes();

        $user->forceFill([
            'two_factor_secret' => Crypt::encryptString($secret),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recovery)),
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => $this->twoFactor->otpauthUrl(config('app.name'), $user->email, $secret),
            'recovery_codes' => $recovery,
        ]);
    }

    public function confirmTwoFactor(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);
        $user = $request->user();

        if (! $user->two_factor_secret) {
            throw ValidationException::withMessages(['code' => ['2FA non initialisée.']]);
        }

        $secret = Crypt::decryptString($user->two_factor_secret);

        if (! $this->twoFactor->verify($secret, $request->code)) {
            throw ValidationException::withMessages(['code' => ['Code invalide.']]);
        }

        $user->forceFill(['two_factor_confirmed_at' => now()])->save();

        return response()->json(['message' => 'Authentification à deux facteurs activée.']);
    }

    public function disableTwoFactor(Request $request): JsonResponse
    {
        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json(['message' => 'Authentification à deux facteurs désactivée.']);
    }
}
