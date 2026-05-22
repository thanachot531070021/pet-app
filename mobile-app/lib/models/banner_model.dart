class BannerModel {
  const BannerModel({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.position,
    required this.status,
    this.linkType,
    this.linkValue,
  });

  final String id;
  final String title;
  final String imageUrl;
  final int position;
  final String status;
  final String? linkType;
  final String? linkValue;

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] as String,
      title: json['title'] as String,
      imageUrl: json['image_url'] as String,
      position: json['position'] as int? ?? 0,
      status: json['status'] as String,
      linkType: json['link_type'] as String?,
      linkValue: json['link_value'] as String?,
    );
  }
}
