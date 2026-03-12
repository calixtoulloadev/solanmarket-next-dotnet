import 'package:dartz/dartz.dart';
import '../models/auth_user.dart';

abstract class AuthRepository {
  Future<Either<String, AuthTokens>> login(String email, String password);
  Future<Either<String, AuthTokens>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  });
  Future<Either<String, void>> logout();
  Future<Either<String, void>> forgotPassword(String email);
}
