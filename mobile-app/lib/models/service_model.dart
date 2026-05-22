class ServiceModel {
  const ServiceModel({
    required this.id,
    required this.name,
    required this.status,
    this.description,
    this.price,
    this.durationMinutes,
    this.imageUrl,
  });

  final String id;
  final String name;
  final String status;
  final String? description;
  final num? price;
  final int? durationMinutes;
  final String? imageUrl;

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      status: json['status'] as String,
      description: json['description'] as String?,
      price: json['price'] as num?,
      durationMinutes: json['duration_minutes'] as int?,
      imageUrl: json['image_url'] as String?,
    );
  }
}
