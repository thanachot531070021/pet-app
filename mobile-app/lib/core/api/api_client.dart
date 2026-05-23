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
    String? token,
  }) async {
    try {
      final response = await _dio.get<dynamic>(
        path,
        queryParameters: queryParameters,
        options: token == null
            ? null
            : Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return _parseResponse(response.data, parse);
    } on DioException catch (error) {
      throw _apiException(error);
    }
  }

  Future<T> postData<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic json) parse, {
    String? token,
  }) async {
    try {
      final response = await _dio.post<dynamic>(
        path,
        data: body,
        options: token == null
            ? null
            : Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return _parseResponse(response.data, parse);
    } on DioException catch (error) {
      throw _apiException(error);
    }
  }

  Future<T> patchData<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic json) parse, {
    String? token,
  }) async {
    try {
      final response = await _dio.patch<dynamic>(
        path,
        data: body,
        options: token == null
            ? null
            : Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return _parseResponse(response.data, parse);
    } on DioException catch (error) {
      throw _apiException(error);
    }
  }

  T _parseResponse<T>(dynamic payload, T Function(dynamic json) parse) {
    if (payload is! Map<String, dynamic> || payload['ok'] != true) {
      final error = payload is Map<String, dynamic>
          ? payload['error'] as Map<String, dynamic>?
          : null;
      throw ApiException(
        error?['message'] as String? ?? 'Unexpected API response',
      );
    }

    return parse(payload['data']);
  }

  ApiException _apiException(DioException error) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final apiError = data['error'];
      if (apiError is Map<String, dynamic>) {
        return ApiException(
          apiError['message'] as String? ?? error.message ?? 'Network error',
        );
      }
    }
    return ApiException(error.message ?? 'Network error');
  }
}
