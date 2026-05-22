import '../core/api/api_client.dart';
import '../models/home_model.dart';
import '../models/news_model.dart';
import '../models/organization_detail_model.dart';
import '../models/organization_model.dart';

class MobileApiService {
  MobileApiService(this._client);

  final ApiClient _client;

  Future<HomeModel> getHome() {
    return _client.getData('/mobile/home', (json) {
      return HomeModel.fromJson(json as Map<String, dynamic>);
    });
  }

  Future<List<OrganizationModel>> getOrganizations(String type, {String? search}) {
    return _client.getData('/mobile/$type', (json) {
      final data = json as Map<String, dynamic>;
      final items = data['items'];
      if (items is! List) return <OrganizationModel>[];
      return items
          .whereType<Map<String, dynamic>>()
          .map(OrganizationModel.fromJson)
          .toList();
    }, queryParameters: {
      'page': 1,
      'perPage': 50,
      if (search != null && search.isNotEmpty) 'search': search,
    });
  }

  Future<OrganizationDetailModel> getOrganizationDetail(String type, String id) {
    return _client.getData('/mobile/$type/$id', (json) {
      return OrganizationDetailModel.fromJson(json as Map<String, dynamic>);
    });
  }

  Future<List<NewsModel>> getNews({String? search}) {
    return _client.getData('/mobile/news', (json) {
      final data = json as Map<String, dynamic>;
      final items = data['items'];
      if (items is! List) return <NewsModel>[];
      return items.whereType<Map<String, dynamic>>().map(NewsModel.fromJson).toList();
    }, queryParameters: {
      'page': 1,
      'perPage': 50,
      if (search != null && search.isNotEmpty) 'search': search,
    });
  }

  Future<NewsModel> getNewsDetail(String id) {
    return _client.getData('/mobile/news/$id', (json) {
      return NewsModel.fromJson(json as Map<String, dynamic>);
    });
  }
}
