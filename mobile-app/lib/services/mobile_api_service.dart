import '../core/api/api_client.dart';
import '../models/auth_models.dart';
import '../models/home_model.dart';
import '../models/news_model.dart';
import '../models/organization_detail_model.dart';
import '../models/organization_model.dart';
import '../models/user_content_models.dart';

class MobileApiService {
  MobileApiService(this._client);

  final ApiClient _client;
  AuthSession? _session;

  bool get isSignedIn => _session != null;
  String? get token => _session?.accessToken;

  Future<AuthProfile?> getCurrentProfile() async {
    final accessToken = token;
    if (accessToken == null) return null;
    return _client.getData('/auth/me', (json) {
      return AuthProfile.fromJson(json as Map<String, dynamic>);
    }, token: accessToken);
  }

  Future<AuthProfile> login(String email, String password) async {
    _session = await _client.postData(
      '/auth/login',
      {'email': email, 'password': password},
      (json) {
        return AuthSession.fromJson(json as Map<String, dynamic>);
      },
    );

    return getCurrentProfile().then((profile) => profile!);
  }

  Future<AuthProfile> signup({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    _session = await _client.postData(
      '/auth/signup',
      {
        'email': email,
        'password': password,
        'fullName': fullName,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      },
      (json) {
        return AuthSession.fromJson(json as Map<String, dynamic>);
      },
    );

    return getCurrentProfile().then((profile) => profile!);
  }

  void logout() {
    _session = null;
  }

  Future<HomeModel> getHome() {
    return _client.getData('/mobile/home', (json) {
      return HomeModel.fromJson(json as Map<String, dynamic>);
    });
  }

  Future<List<OrganizationModel>> getOrganizations(
    String type, {
    String? search,
  }) {
    return _client.getData(
      '/mobile/$type',
      (json) {
        final data = json as Map<String, dynamic>;
        final items = data['items'];
        if (items is! List) return <OrganizationModel>[];
        return items
            .whereType<Map<String, dynamic>>()
            .map(OrganizationModel.fromJson)
            .toList();
      },
      queryParameters: {
        'page': 1,
        'perPage': 50,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
  }

  Future<OrganizationDetailModel> getOrganizationDetail(
    String type,
    String id,
  ) {
    return _client.getData('/mobile/$type/$id', (json) {
      return OrganizationDetailModel.fromJson(json as Map<String, dynamic>);
    });
  }

  Future<List<NewsModel>> getNews({String? search}) {
    return _client.getData(
      '/mobile/news',
      (json) {
        final data = json as Map<String, dynamic>;
        final items = data['items'];
        if (items is! List) return <NewsModel>[];
        return items
            .whereType<Map<String, dynamic>>()
            .map(NewsModel.fromJson)
            .toList();
      },
      queryParameters: {
        'page': 1,
        'perPage': 50,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
  }

  Future<NewsModel> getNewsDetail(String id) {
    return _client.getData('/mobile/news/$id', (json) {
      return NewsModel.fromJson(json as Map<String, dynamic>);
    });
  }

  Future<List<FavoriteItem>> getFavorites() {
    final accessToken = token;
    if (accessToken == null) return Future.value(const []);
    return _client.getData(
      '/mobile/me/favorites',
      (json) {
        final data = json as Map<String, dynamic>;
        final items = data['items'];
        if (items is! List) return <FavoriteItem>[];
        return items
            .whereType<Map<String, dynamic>>()
            .map(FavoriteItem.fromJson)
            .toList();
      },
      queryParameters: {'page': 1, 'perPage': 50},
      token: accessToken,
    );
  }

  Future<List<BookingItem>> getBookings() {
    final accessToken = token;
    if (accessToken == null) return Future.value(const []);
    return _client.getData(
      '/mobile/me/bookings',
      (json) {
        final data = json as Map<String, dynamic>;
        final items = data['items'];
        if (items is! List) return <BookingItem>[];
        return items
            .whereType<Map<String, dynamic>>()
            .map(BookingItem.fromJson)
            .toList();
      },
      queryParameters: {'page': 1, 'perPage': 50},
      token: accessToken,
    );
  }

  Future<void> addFavorite(String organizationId) async {
    final accessToken = token;
    if (accessToken == null) return;
    await _client.postData(
      '/mobile/me/favorites',
      {'organizationId': organizationId},
      (_) => null,
      token: accessToken,
    );
  }

  Future<void> createReview({
    required String organizationId,
    required int rating,
    String? comment,
  }) async {
    final accessToken = token;
    if (accessToken == null) return;
    await _client.postData(
      '/mobile/me/reviews',
      {
        'organizationId': organizationId,
        'rating': rating,
        if (comment != null && comment.isNotEmpty) 'comment': comment,
      },
      (_) => null,
      token: accessToken,
    );
  }

  Future<void> createBooking({
    required String organizationId,
    String? serviceId,
    required DateTime scheduledAt,
    String? note,
  }) async {
    final accessToken = token;
    if (accessToken == null) return;
    await _client.postData(
      '/mobile/me/bookings',
      {
        'organizationId': organizationId,
        if (serviceId != null) 'serviceId': serviceId,
        'scheduledAt': scheduledAt.toUtc().toIso8601String(),
        if (note != null && note.isNotEmpty) 'note': note,
      },
      (_) => null,
      token: accessToken,
    );
  }
}
