import 'banner_model.dart';
import 'news_model.dart';
import 'organization_model.dart';

class HomeModel {
  const HomeModel({
    required this.banners,
    required this.shops,
    required this.clinics,
    required this.news,
  });

  final List<BannerModel> banners;
  final List<OrganizationModel> shops;
  final List<OrganizationModel> clinics;
  final List<NewsModel> news;

  factory HomeModel.fromJson(Map<String, dynamic> json) {
    return HomeModel(
      banners: _list(json['banners'], BannerModel.fromJson),
      shops: _list(json['shops'], OrganizationModel.fromJson),
      clinics: _list(json['clinics'], OrganizationModel.fromJson),
      news: _list(json['news'], NewsModel.fromJson),
    );
  }

  static List<T> _list<T>(
    dynamic value,
    T Function(Map<String, dynamic> json) parse,
  ) {
    if (value is! List) return [];
    return value.whereType<Map<String, dynamic>>().map(parse).toList();
  }
}
