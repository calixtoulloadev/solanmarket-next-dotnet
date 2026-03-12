import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/models/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../../../../core/network/dio_client.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _ds;
  AuthRepositoryImpl(this._ds);

  @override
  Future<Either<String, AuthTokens>> login(
    String email,
    String password,
  ) async {
    try {
      final tokens = await _ds.login(email, password);
      await DioClient.saveTokens(tokens.accessToken, tokens.refreshToken);
      return Right(tokens);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  @override
  Future<Either<String, AuthTokens>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    try {
      final tokens = await _ds.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
      );
      await DioClient.saveTokens(tokens.accessToken, tokens.refreshToken);
      return Right(tokens);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  @override
  Future<Either<String, void>> logout() async {
    try {
      await _ds.logout();
      await DioClient.clearTokens();
      return const Right(null);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  @override
  Future<Either<String, void>> forgotPassword(String email) async {
    try {
      await _ds.forgotPassword(email);
      return const Right(null);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  String _mapError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('error')) {
        return data['error'] as String;
      }
      if (data is Map && data.containsKey('title')) {
        return data['title'] as String;
      }
      return 'Error ${e.response!.statusCode}';
    }
    return 'Network error. Please check your connection.';
  }
}
