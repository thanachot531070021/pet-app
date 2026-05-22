class OrganizationModel {
  const OrganizationModel({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.phone,
    this.email,
    this.address,
    this.province,
    this.district,
    this.subdistrict,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String type;
  final String status;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final String? phone;
  final String? email;
  final String? address;
  final String? province;
  final String? district;
  final String? subdistrict;
  final double? latitude;
  final double? longitude;

  factory OrganizationModel.fromJson(Map<String, dynamic> json) {
    return OrganizationModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      description: json['description'] as String?,
      logoUrl: json['logo_url'] as String?,
      coverUrl: json['cover_url'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      address: json['address'] as String?,
      province: json['province'] as String?,
      district: json['district'] as String?,
      subdistrict: json['subdistrict'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}
