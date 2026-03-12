import 'package:dio/dio.dart';
import '../../domain/models/auth_user.dart';

abstract class AuthRemoteDataSource {
  Future<AuthTokens> login(String email, String password);
  Future<AuthTokens> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  });
  Future<void> logout();
  Future<void> forgotPassword(String email);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio _dio;
  AuthRemoteDataSourceImpl(this._dio);

  @override
  Future<AuthTokens> login(String email, String password) async {
    final resp = await _dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    return AuthTokens.fromJson(resp.data as Map<String, dynamic>);
  }

  @override
  Future<AuthTokens> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final resp = await _dio.post(
      '/auth/register',
      data: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
      },
    );
    return AuthTokens.fromJson(resp.data as Map<String, dynamic>);
  }

  @override
  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _dio.post('/auth/forgot-password', data: {'email': email});
  }
}
