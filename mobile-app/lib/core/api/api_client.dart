import 'package:dio/dio.dart';

import '../constants/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient()
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            headers: {'Content-Type': 'application/json'},
          ),
        );

  final Dio _dio;

  Future<T> getData<T>(
    String path,
    T Function(dynamic json) parse, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get<dynamic>(
        path,
        queryParameters: queryParameters,
      );
      final payload = response.data;
      if (payload is! Map<String, dynamic> || payload['ok'] != true) {
        final error = payload is Map<String, dynamic>
            ? payload['error'] as Map<String, dynamic>?
            : null;
        throw ApiException(error?['message'] as String? ?? 'Unexpected API response');
      }

      return parse(payload['data']);
    } on DioException catch (error) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        final apiError = data['error'];
        if (apiError is Map<String, dynamic>) {
          throw ApiException(apiError['message'] as String? ?? error.message ?? 'Network error');
        }
      }
      throw ApiException(error.message ?? 'Network error');
    }
  }
}
