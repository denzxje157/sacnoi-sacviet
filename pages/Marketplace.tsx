import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';

interface Product {
  id: string;
  name: string;
  ethnic: string;
  price: string;
  desc: string;
  artisan: string;
  exp: string;
  img: string;
  sold: number;
  category: string;
}

// ==========================================
// DỮ LIỆU SẢN PHẨM & HELPERS
// ==========================================

// Helper để tạo ảnh giả lập dựa trên tên sản phẩm
const getImageForProduct = (name: string, index: number) => {
  const n = name.toLowerCase();
  let keyword = 'craft';
  
  if (n.includes('gùi') || n.includes('đan') || n.includes('sọt') || n.includes('giỏ')) keyword = 'wicker+basket';
  else if (n.includes('thổ cẩm') || n.includes('dệt') || n.includes('khăn') || n.includes('áo') || n.includes('váy') || n.includes('chăn')) keyword = 'fabric+pattern';
  else if (n.includes('gốm') || n.includes('bình')) keyword = 'ceramic+vase';
  else if (n.includes('đàn') || n.includes('kèn') || n.includes('sáo') || n.includes('trống') || n.includes('chiêng')) keyword = 'musical+instrument';
  else if (n.includes('rượu')) keyword = 'wine+bottle';
  else if (n.includes('bạc') || n.includes('trang sức') || n.includes('vòng')) keyword = 'silver+jewelry';
  else if (n.includes('tranh') || n.includes('đông hồ')) keyword = 'art+painting';
  else if (n.includes('nón') || n.includes('mũ')) keyword = 'hat+straw';
  else if (n.includes('lụa')) keyword = 'silk+fabric';
  
  const suffix = index % 2 === 0 
    ? '1590736962231-419b6727768e' 
    : `1528127269322-539801943592?auto=format&fit=crop&q=80&w=600&h=600&keyword=${keyword}&sig=${index}`;
    
  return `https://images.unsplash.com/photo-${suffix}`;
};

// DỮ LIỆU SẢN PHẨM CẬP NHẬT VỚI MÔ TẢ CÂU CHUYỆN (Storytelling Descriptions)
export const rawData = [
  // 1-13
  { e: "BA NA", items: [
    { n: "Gùi mini (Trang trí)", p: "50.000 - 150.000 VNĐ", img: "https://down-vn.img.susercontent.com/file/78d869fc7f29ac98f4a7a1aaf725cd57", d: "Phiên bản thu nhỏ của chiếc gùi đại ngàn, được đan tỉ mỉ bởi đôi tay khéo léo của người Ba Na. Nó không chỉ là vật trang trí, mà là lời nhắc nhở về sự cần cù, chịu khó và vẻ đẹp mộc mạc của núi rừng Tây Nguyên." },
    { n: "Gùi múa (Biểu diễn)", p: "250.000 - 450.000 VNĐ", img: "https://cdn.nhandan.vn/images/22f099ca8bc7ae81aa2a8d3416a84bf8141e17aab8e836f6a34f0689f96932c4b79cc3f1de038d147c96eecef8a31cbd392c3683b956cc79feec098a0166d49cb7ae13cda333b1a658a4aa09dbd85477/tn2-6506.jpg.webp", d: "Chiếc gùi nhẹ nhàng, thanh thoát dùng trong các điệu múa xoang truyền thống. Mỗi nhịp gùi đung đưa là một nhịp thở của buôn làng trong ngày hội mùa, cầu mong mưa thuận gió hòa." },
    { n: "Gùi sinh hoạt (Đi rẫy)", p: "500.000 - 800.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/tho-cam-dan-toc/gui-dan-toc/gui-dan-toc-12.jpg", d: "Người bạn đường thân thiết của phụ nữ Ba Na. Được đan từ mây tre già bền bỉ, chiếc gùi này cõng cả nương rẫy, cõng cả những đứa trẻ lớn lên trên lưng mẹ, thấm đẫm mồ hôi và tình yêu thương." },
    { n: "Gùi hoa văn tinh xảo (Có nắp)", p: "1.200.000 - 2.000.000 VNĐ", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeSErQPmB8EADVc11kratrcNk0bBfttJfpxg&s", d: "Kiệt tác đan lát với hoa văn hình học phức tạp (K'tơh). Đây là vật gia bảo, thường dùng để đựng tư trang quý giá hoặc làm quà sính lễ, thể hiện sự trân trọng và khéo léo tuyệt đỉnh." },
    { n: "Gốm", p: "Từ 150.000 VNĐ trở lên", img: "https://baovinhlong.com.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/dataimages/201702/original/images1824596_BVL_image003.jpg", d: "Được nung lộ thiên bằng rơm rạ và củi, gốm Ba Na mang vẻ đẹp mộc mạc, ám khói thời gian. Mỗi sản phẩm là sự giao hòa ngẫu hứng giữa đất và lửa, không cái nào giống cái nào." },
    { n: "Chiếu", p: "500.000 - 1.500.000 VNĐ", img: "https://culaochamtourist.vn/wp-content/uploads/2023/07/lang-chieu-ban-thach-2.jpg", d: "Tấm chiếu dệt thủ công từ cây lác rừng, êm ái và mát lạnh. Nơi đây chứng kiến bao câu chuyện kể khan bên bếp lửa, là nơi giấc ngủ đại ngàn được vỗ về bình yên." }
  ]},
  { e: "BỐ Y", items: [
    { n: "Khèn bè", p: "Từ 150.000 VNĐ", img: "https://dotchuoinon.com/wp-content/uploads/2015/03/boy17_khc3a8n-c491b.jpg?w=474", d: "Âm thanh của khèn bè như tiếng suối chảy, tiếng gió reo. Chàng trai Bố Y gửi gắm tâm tình vào tiếng khèn để gọi bạn tình, tiếng khèn nối liền đôi lứa giữa trập trùng núi đá." },
    { n: "Kèn lá", p: "Miễn phí", img: "https://dotchuoinon.com/wp-content/uploads/2015/03/boy13-kc3a8n-lc3a1.jpg?w=474", d: "Chỉ một chiếc lá rừng đơn sơ cũng có thể cất lên điệu nhạc da diết. Đây là nhạc cụ của tâm hồn, của những phút ngẫu hứng giữa thiên nhiên bao la." }
  ]},
  { e: "BRÂU", items: [
    { n: "Gùi nhỏ (Mini/Trang trí)", p: "150.000 – 300.000 VNĐ", img: "https://product.hstatic.net/200000106437/product/gui_tay_nguyen_kich_thuoc_nho_dung_hat_1679a917d3f241c0bbb9cf25daa20e1e_grande.jpg", d: "Vật phẩm lưu niệm nhỏ xinh mang hồn cốt người Brâu. Dù nhỏ bé nhưng vẫn giữ nguyên kỹ thuật đan lát tinh xảo, là món quà mang hơi thở đại ngàn về phố thị." },
    { n: "Gùi trung (Thông dụng)", p: "300.000 – 600.000 VNĐ", img: "https://upload.wikimedia.org/wikipedia/commons/c/c9/The_papoose_of_people_Ede.jpg", d: "Vật dụng gắn liền với đời sống hàng ngày, bền bỉ cùng năm tháng. Chiếc gùi theo chân người Brâu lên rẫy, xuống suối, là chứng nhân cho sự cần lao." },
    { n: "Gùi cao cấp (Đan kín họa tiết)", p: "1.200.000 – 1.500.000 VNĐ trở lên", img: "https://dantra.vn/uploads/san-pham/khay-sot-cac-loai/gui/gui-dan-toc-11.jpg", d: "Đỉnh cao của nghệ thuật đan lát Brâu. Các nan tre được nhuộm màu tự nhiên, đan cài kín kẽ tạo nên những hoa văn cổ truyền, thể hiện đẳng cấp và khiếu thẩm mỹ của người sở hữu." }
  ]},
  { e: "BRU - VÂN KIỀU", items: [
    { n: "Trang phục truyền thống & Thổ cẩm", p: "Từ 1.000.000 VNĐ trở lên", img: "https://afamilycdn.com/150157425591193600/2021/3/16/15997297728452857924195383843884882270463127n-16158657822271823021731-16158664079071277090625.jpg", d: "Bộ trang phục rực rỡ sắc màu, đặc biệt là chiếc khăn đội đầu quấn gọn gàng. Từng đường kim mũi chỉ là sự gửi gắm niềm tự hào dân tộc của người Bru - Vân Kiều dưới dãy Trường Sơn." }
  ]},
  { e: "CHĂM", items: [
    { n: "Gốm bàn xoay (Bàu Trúc)", p: "Từ 100.000 VNĐ trở lên", img: "https://images.vietnamtourism.gov.vn/vn//images/dacsacnghegom1.jpg", d: "Gốm 'nở hoa' trên lửa. Không dùng bàn xoay, người nghệ nhân Chăm đi giật lùi quanh khối đất, gửi gắm nhịp thở và hồn vía vào từng thớ đất sét sông Quao linh thiêng." },
    { n: "Sản phẩm dệt thổ cẩm (Mỹ Nghiệp)", p: "Từ 50.000 VNĐ trở lên", img: "https://cdnphoto.dantri.com.vn/i2F5iSb4_hLgF3V3SgglyeN6_go=/thumb_w/1020/2022/11/23/lang-my-nghiepdocx-1669173001168.png", d: "Mỗi tấm vải là một bức tranh thu nhỏ về vũ trụ quan của người Chăm. Hoa văn thần Shiva, thần Ganesha được dệt nổi tinh tế, kể lại những huyền thoại Champa cổ xưa." }
  ]},
  { e: "CHƠ RO", items: [
    { n: "Đàn tre Goong Cla", p: "Từ 350.000 VNĐ", img: "https://imagevietnam.vnanet.vn//MediaUpload/Org/2022/05/27/lythinhien527-10-11-20.jpg", d: "Được làm từ ống tre già, tiếng đàn Goong Cla thánh thót như tiếng suối reo vui. Đây là nhạc cụ kết nối cộng đồng trong những đêm lửa trại bập bùng." },
    { n: "Dàn Chinh (Cồng chiêng)", p: "Từ 2.500.000 VNĐ", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Chi%C3%AAng_%C4%91%E1%BB%93ng.jpg/330px-Chi%C3%AAng_%C4%91%E1%BB%93ng.jpg", d: "Báu vật của buôn làng. Tiếng Chinh vang lên là báo hiệu mùa lễ hội, là cầu nối giữa con người và thần linh (Yang), mang theo khát vọng về cuộc sống ấm no." }
  ]},
  { e: "CHU RU", items: [
    { n: "Gốm K’Răng Gọ (Nghệ nhân Ma Ly)", p: "(Giá tùy sản phẩm)", img: "https://images.baodantoc.vn/uploads/2021/1/18/root41/H%C3%ACnh%204.jpg", d: "Dòng gốm mộc mạc đang được hồi sinh. Mỗi sản phẩm không chỉ là vật dụng mà còn là tâm huyết của nghệ nhân Ma Ly muốn giữ gìn ngọn lửa nghề truyền thống của cha ông." },
    { n: "Gùi mini (Quà tặng)", p: "200.000 – 400.000 VNĐ", img: "https://qualuuniemvn.com/uploads/shops/files/gui-mini.jpg", d: "Món quà nhỏ mang ý nghĩa lớn. Chiếc gùi mini gói ghém tình cảm hiếu khách và sự khéo léo của người Chu Ru gửi đến bạn bè phương xa." },
    { n: "Gùi thông dụng", p: "500.000 – 1.000.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/gui-dan-toc/gui-dan-toc-31.jpg", d: "Vật dụng thiết thân trong mọi nếp nhà Chu Ru. Đan từ tre nứa chọn lọc, chiếc gùi bền bỉ cùng người dân đi qua bao mùa rẫy." },
    { n: "Gùi lễ vật (Gùi cưới tinh xảo)", p: "1.500.000 – 3.000.000 VNĐ", img: "https://imagevietnam.vnanet.vn/Upload/2017/10/17/17102017100458445-Ya-Hieg_26_resize.JPG", d: "Chiếc gùi đẹp nhất, trang trọng nhất dùng trong ngày cưới. Nó chứa đựng sính lễ và cả lời chúc phúc trăm năm, được đan bằng tất cả tài hoa và sự trân trọng." }
  ]},
  { e: "CHỨT", items: [
    { n: "Đàn Chưrabon (Phổ thông)", p: "500.000 – 900.000 VNĐ", img: "https://cdn.baohatinh.vn/images/27a0ad0fe483fdf921c9b9fc23e3afaa65a85e1e36cf660e342c7e228013ed686a3cf1c09ae70bdc723f57af739489ab/106d5061100t101554l2.jpg", d: "Nhạc cụ dây độc đáo của người Chứt. Tiếng đàn trầm bổng kể về cuộc sống nơi hang đá xưa kia và khát vọng vươn lên cuộc sống mới." },
    { n: "Đàn Chưrabon (Nghệ nhân chế tác)", p: "1.500.000 – 3.000.000 VNĐ", img: "https://cdn.baohatinh.vn/images/27a0ad0fe483fdf921c9b9fc23e3afaa65a85e1e36cf660e342c7e228013ed680fb633871a4cb834d41dc20e5cadaeeb/106d5061100t101553l1.jpg", d: "Phiên bản cao cấp được chế tác bởi những nghệ nhân lão luyện. Âm thanh đạt độ chuẩn mực, là báu vật gìn giữ bản sắc văn hóa tộc người." }
  ]},
  { e: "CO", items: [
    { n: "Trang sức cườm", p: "Từ 50.000 VNĐ", img: "https://pos.nvncdn.com/71e899-15049/ps/20191225_L5NAm4eQR7K6arpOWS8nWmGX.jpg?v=1676095683", d: "Những chuỗi cườm đá ngũ sắc rực rỡ quấn quanh cổ, quanh eo là niềm tự hào của phụ nữ Co. Nó tượng trưng cho vẻ đẹp, sự giàu có và địa vị trong cộng đồng." }
  ]},
  { e: "Cơ HO", items: [
    { n: "Sản phẩm đan lát", p: "Từ 80.000 VNĐ", img: "https://cly.1cdn.vn/2023/11/01/taynguyen-kimanh-3-1942.jpg", d: "Từ những sợi mây, sợi tre vô tri, qua bàn tay người Cơ Ho đã trở thành những vật dụng tinh xảo. Mỗi mối đan là sự kiên nhẫn và tình yêu với thiên nhiên." },
    { n: "Thổ cẩm K'Ho", p: "Từ 150.000 VNĐ", img: "https://imagevietnam.vnanet.vn/Upload/2018/1/5/05012018101859794-Tho-cam_17_resize.JPG", d: "Sắc màu thổ cẩm K'Ho rực rỡ như hoa rừng. Họa tiết trên vải kể lại những câu chuyện về muông thú, núi rừng và thần linh che chở buôn làng." },
    { n: "Cà phê K'Ho", p: "250.000 – 500.000 VNĐ/kg", img: "https://images.squarespace-cdn.com/content/v1/546f111fe4b0719612dda3f1/1444308876368-ROF484O43BSGAOZU3LW9/image-asset.jpeg?format=1000w", d: "Hương vị cà phê Arabica thượng hạng trồng trên đỉnh Langbiang. Mỗi hạt cà phê là kết tinh của đất đỏ bazan, sương mù cao nguyên và mồ hôi người nông dân K'Ho." }
  ]},
  { e: "CỜ LAO", items: [
    { n: "Sản phẩm đan lát", p: "Từ 30.000 VNĐ", img: "https://thiennhienmoitruong.vn/upload2024/images/btv-t-phuong-2/161.jpg", d: "Vật dụng đơn sơ nhưng bền bỉ, phản ánh cuộc sống thích nghi với vùng núi đá tai mèo khắc nghiệt của người Cờ Lao." },
    { n: "Thổ cẩm & Trang phục truyền thống", p: "Từ 40.000 VNĐ trở lên", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG3ajmRimTrHVXlXKNfCEhehGllOWzvEy3qA&s", d: "Bộ trang phục ghép vải độc đáo, màu sắc hài hòa. Đây là nhận diện văn hóa không thể trộn lẫn của người Cờ Lao giữa cao nguyên đá." }
  ]},
  { e: "Cơ TU", items: [
    { n: "Sản phẩm đan lát truyền thống", p: "Từ 150.000 VNĐ trở lên", img: "https://imagevietnam.vnanet.vn/Upload/2020/12/18/18122020101536870-20_resize.JPG", d: "Nghệ thuật đan lát của người Cơ Tu đạt trình độ điêu luyện với các hoa văn cườm trắng nổi bật trên nền mây đen, tạo nên vẻ đẹp huyền bí và mạnh mẽ." }
  ]},
  { e: "CỐNG", items: [
    { n: "Chiếu mây loại thường", p: "1.500.000 – 3.000.000 VNĐ", img: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2025/08/chieu-may-5.jpg", d: "Được dệt từ những sợi mây rừng chọn lọc, chiếu mây người Cống nổi tiếng bền đẹp, càng dùng càng bóng, mang lại giấc ngủ ngon lành." },
    { n: "Chiếu mây cao cấp", p: "4.000.000 – 8.000.000 VNĐ", img: "https://thegioichieutruc.com/wp-content/uploads/2024/09/Uu1-4.png", d: "Tuyệt phẩm thủ công đòi hỏi hàng tháng trời lao động. Những sợi mây nhỏ nhất, đều nhất được tuyển chọn để dệt nên tấm chiếu mềm mại như lụa, quý giá vô cùng." }
  ]},

  // 14-22
  { e: "DAO", items: [
    { n: "Thuốc tắm người Dao đỏ", p: "30.000 – 150.000 VNĐ", img: "https://media.loveitopcdn.com/28306/thumb/600x600/091916-nuoc-tam-dao-do-danh-cho-phu-nu-sau-sinh-cham-soc-suc-khoe-sau-sinh.jpg?zc=1", d: "Bài thuốc bí truyền từ hàng trăm loại lá rừng, giúp hồi phục sức khỏe thần kỳ, đặc biệt cho phụ nữ sau sinh. Ngâm mình trong thùng gỗ pơ mu, mọi mệt mỏi tan biến." },
    { n: "Trang sức Bạc chạm khắc", p: "500.000 – Vài triệu đồng", img: "https://baothainguyen.vn/file/oldimage/baothainguyen/UserFiles/image/20210506100449_chambac1.jpg", d: "Bạc không chỉ là trang sức mà còn là bùa hộ mệnh, là của hồi môn. Nghệ thuật chạm khắc bạc của người Dao đạt đến độ tinh xảo với hoa văn chim muông, hoa lá sống động." },
    { n: "Tranh thờ", p: "Từ 800.000 VNĐ", img: "https://media.vietnamplus.vn/images/bc12065fef1dc485941a5ad9a9fec4717fb4d9e3186add1d79fcc8e23698e0a4642d215268d27a0650010b9b06e1c5663baf0aa24dfd57111e811a4b44265e78/ttxvntranh_tho5.jpg", d: "Bộ tranh thờ Đạo giáo huyền bí, thể hiện thế giới tâm linh phong phú của người Dao. Mỗi bức tranh là một câu chuyện về vũ trụ, răn dạy đạo lý làm người." }
  ]},
  { e: "Ê ĐÊ", items: [
    { n: "Gùi mini/trang trí", p: "140.000 – 300.000 VNĐ", img: "https://product.hstatic.net/200000106437/product/gui_tay_nguyen_trang_tri_cam_hoa_dep_mat_19497286db72407198339cf5ac70bee8.jpg", d: "Biểu tượng của Tây Nguyên thu nhỏ. Chiếc gùi xinh xắn mang theo hơi thở của đất đỏ bazan về không gian sống của bạn." },
    { n: "Gùi đan thưa (Đi rẫy)", p: "Khoảng 720.000 VNĐ", img: "https://daklakmuseum.vn/baotangdaklak/imgs/169707792221527.jpeg", d: "Chiếc gùi chuyên dụng để đựng củi, đựng nước. Các mắt đan thưa giúp thoát nước, nhẹ nhàng nhưng chịu lực cực tốt." },
    { n: "Gùi đan kín họa tiết", p: "1.400.000 – 1.500.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/tho-cam-dan-toc/gui-dan-toc/gui-dan-toc-9.jpg", d: "Tác phẩm nghệ thuật trên lưng người phụ nữ Ê Đê. Những hoa văn đen đỏ nổi bật trên nền tre vàng óng ả thể hiện sự khéo léo và thẩm mỹ tinh tế." },
    { n: "Nhạc cụ Bro (Lưu niệm)", p: "300.000 – 600.000 VNĐ", img: "https://dotchuoinon.com/wp-content/uploads/2015/06/broh_bro-ce1bba7a-ngc6b0e1bb9di-c3aadc3aa1.jpg", d: "Cây đàn của những chàng trai si tình. Tiếng đàn Bro trầm ấm, mộc mạc như lời tỏ tình e ấp dưới ánh trăng." },
    { n: "Nhạc cụ Bro (Biểu diễn)", p: "1.200.000 – 3.000.000 VNĐ", img: "https://nhaccuphongvan.vn/wp-content/uploads/2015/06/Broh2.jpg", d: "Nhạc cụ chuyên nghiệp với âm thanh chuẩn xác, vang vọng. Chế tác từ những quả bầu khô tròn trịa và ống tre già nhất rừng." }
  ]},
  { e: "GIA RAI", items: [
    { n: "Rượu cần", p: "Từ 300.000 VNĐ trở lên", img: "https://www.vangdanh.com/wp-content/uploads/2024/04/ruou-can-y-mien-avatar-15.jpg", d: "Men say của đại ngàn. Rượu cần Gia Rai ủ bằng lá rừng và gạo nương, uống vào không đau đầu mà chỉ thấy lâng lâng tình người, tình đất." }
  ]},
  { e: "GIÁY", items: [
    { n: "Sáo ngang (Náu Vang)", p: "200.000 – 500.000 VNĐ", img: "https://tatham.vn/media/news/2802_saongang.jpg", d: "Tiếng sáo vút cao trên đỉnh núi mây mù. Chàng trai Giáy thổi sáo để gửi lòng mình theo gió, tìm bạn tri âm." },
    { n: "Giày thêu tay thủ công", p: "400.000 – 800.000 VNĐ", img: "https://dantocmiennui-media.baotintuc.vn/images/b02bcd7dc301a62e318b19b2cae4453cf67c7e73476a92d7509526f2ea78aa7ce2f70135d22d21a88dc4a7c7b5fcf1dd/3a.jpg", d: "Đôi giày vải thêu hoa văn sặc sỡ, nâng niu bàn chân người phụ nữ Giáy. Từng đường kim mũi chỉ là sự kiên nhẫn và tình yêu cái đẹp." }
  ]},
  { e: "GIÉ TRIÊNG", items: [
    { n: "Gùi", p: "300.000 – 900.000 VNĐ", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lyp6sdisbbfl86", d: "Chiếc gùi của người Gié Triêng có dáng vẻ thanh mảnh, độc đáo. Nó gắn liền với tục 'củi hứa hôn', minh chứng cho sự đảm đang của người con gái." },
    { n: "Đàn Đinh Tút", p: "Từ 300.000 VNĐ", img: "https://dbnd.1cdn.vn/2023/11/25/images-2cae99c722739fd7811264aa24039009df45a530ab4c1409bb79bdfbb5b5df067526b8db971d2a89a6f3669679fae53784a7f0e98f6d1708ff7d5d6c30c8863e-_3-1700913420783.jpg", d: "Loại nhạc cụ tre nứa thổi bằng hơi, âm thanh rộn ràng như tiếng gió đùa qua khe suối, thường được chơi trong các lễ hội cộng đồng." },
    { n: "Ống đựng bằng tre", p: "(Tùy loại)", img: "https://lh4.googleusercontent.com/proxy/P-5viXCOjlSlbiSCGTsgogt1KMs8-niLVFMLujeNnU9aJ1Pu4Fx2ZADgGTs3zphPZAJimg3G4d2IQQI-85nnRI3lmbcWbmxMtRwLQzLhVdXMzwY7Sl7QuoqwLR2vk8rn35vmMEd3mGR5AHANphmdoc0bn1cYJesgUzL7PaGzzwr1I2JubbWhgj3F", d: "Vật dụng đơn giản nhưng hữu ích, dùng để đựng hạt giống, muối hay cơm lam. Ống tre già bóng loáng, bền bỉ theo thời gian." }
  ]},
  { e: "HÀ NHÌ", items: [
    { n: "Đàn Hó Tơ", p: "800.000 – 1.800.000 VNĐ", img: "https://laichau.gov.vn/upload/2000066/20200214/5f8794f2a471ed89a48b063d263f2ce1dao2752019sau.JPG", d: "Cây đàn 3 dây với bầu cộng hưởng hình tam giác độc đáo. Tiếng đàn Hó Tơ trầm bổng là người bạn tâm tình của chàng trai Hà Nhì bên bếp lửa hồng." },
    { n: "Mâm mây (Đan thủ công)", p: "2.500.000 – 3.000.000 VNĐ", img: "https://dacsantaybac.vn/wp-content/uploads/2025/01/Loi-ich-khi-su-dung-mam-may-Anh-tu-Minh-Thu.jpg", d: "Chiếc mâm tròn đan bằng mây rừng, vừa là vật dụng ăn uống, vừa là vật cúng tế linh thiêng. Kỹ thuật đan tinh xảo giúp mâm bền chắc qua nhiều thế hệ." }
  ]},
  { e: "HOA", items: [
    { n: "Bánh bột truyền thống", p: "15.000 – 45.000 VNĐ", img: "https://cdn.diemnhangroup.com/seoulacademy/2023/04/cach-lam-banh-bot-nguoi-hoa-6.jpg", d: "Hương vị ngọt ngào của người Hoa. Những chiếc bánh bò, bánh tiêu, bánh pía... không chỉ là món ăn mà còn gói ghém văn hóa ẩm thực nghìn năm." }
  ]},
  { e: "H'MÔNG (MÔNG)", items: [
    { n: "Khèn Mông", p: "400.000 – 2.000.000 VNĐ", img: "https://nhaccuphongvan.vn/wp-content/uploads/2019/04/z2360494894774_8d5faf7c8186e5c843195f2b812d36db.jpg", d: "Linh hồn của người Mông trên cao nguyên đá. Sống trên đá, chết vùi trong đá, tiếng khèn vẫn vang vọng gọi bạn tình, gọi tổ tiên, mạnh mẽ và da diết khôn nguôi." }
  ]},
  { e: "HRÊ", items: [
    { n: "Cà vạt thổ cẩm", p: "80.000 – 150.000 VNĐ", img: "https://thocamyhoa.vn/wp-content/uploads/2024/05/ca-vat-tho-cam28-800x1067.jpg", d: "Sự kết hợp giữa truyền thống và hiện đại. Họa tiết thổ cẩm Hrê tạo điểm nhấn độc đáo cho trang phục âu phục, mang bản sắc văn hóa vào đời sống đương đại." },
    { n: "Túi xách thổ cẩm", p: "100.000 – 300.000 VNĐ", img: "https://thocamyhoa.vn/wp-content/uploads/2024/12/tui-tho-cam10-768x594.jpg", d: "Chiếc túi nhỏ xinh dệt từ sợi bông tự nhiên, nhuộm màu rễ cây. Mỗi đường nét hoa văn là một câu chuyện về thiên nhiên núi rừng Quảng Ngãi." },
    { n: "Khăn choàng (K'tu)", p: "150.000 – 350.000 VNĐ", img: "https://tourdulichdaolyson.com/view/at_nghe-det-tho-cam-o-lang-teng-xu-quang_2460f08305a48abffeda3dc8728bae81.jpg", d: "Tấm khăn choàng ấm áp, che chở người Hrê qua mùa gió lạnh. Màu đỏ đen chủ đạo tượng trưng cho lửa và đất đai màu mỡ." },

    { n: "Váy (K'chiu) & Áo nữ", p: "800.000 – 2.000.000 VNĐ", img: "https://product.hstatic.net/200000774833/product/3eac7173-5f5a-4796-a097-43bfebe49236_b242f9852255488b94ce14e5b3d5e1e3.jpeg", d: "Bộ trang phục duyên dáng của phụ nữ Hrê. Sự phối màu tinh tế và kỹ thuật dệt điêu luyện tạo nên vẻ đẹp mặn mà, đằm thắm." }
  ]},

  // 23-35
  { e: "KHÁNG", items: [
    { n: "Ống đựng xôi (Khẩu tuổng)", p: "Từ 80.000 VNĐ", img: "https://dacsanvungtaybac.org/wp-content/uploads/2025/08/dacsanvungtaybac-org-3.webp", d: "Hương nếp nương thơm lừng được ủ ấm trong chiếc 'Khẩu tuổng' đan bằng mây. Vật dụng giữ nhiệt tự nhiên, giữ trọn vị ngon của hạt ngọc trời." },
    { n: "Hòm mây", p: "Từ 350.000 VNĐ", img: "https://lh4.googleusercontent.com/proxy/tDxtMOtJ1c_gdEScZQnfzRrFmWmqzIJ7ger03DlfGhtjuh8X1t3Zt3P_nLbbrWLj89kFoQ9JTRabBItm219sdW3a0fjQLybkw1uJ29BTHv4JvUo2FlwKTqi96C2ifHG09yO0PrqvQyOQqI-suJJVcVmSINfg-kV-CXid4lOrFKb_Rh_1SEYgamvx", d: "Chiếc vali của người vùng cao. Hòm mây chắc chắn, kín đáo dùng để đựng quần áo, tư trang, theo chân người Kháng trong những chuyến đi xa." },
    { n: "Hưn mạy (Nhạc cụ)", p: "Từ 800.000 VNĐ", img: "https://media.vov.vn/sites/default/files/styles/large_watermark/public/2021-07/hun_may-nhac_cu_truyen_thong_cua_dong_bao_khang.jpg", d: "Nhạc cụ độc đáo làm từ ống tre, khi gõ xuống sàn tạo ra âm thanh cộng hưởng trầm hùng, nhịp nhàng cho điệu múa sạp vui tươi." }
  ]},
  { e: "KHMER", items: [
    { n: "Gùi nhỏ (Srok - Lưu niệm)", p: "150.000 – 300.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/khay-sot-cac-loai/gui/gui-tre-dan-toc.jpg", d: "Phiên bản nhỏ của chiếc 'Srok' đựng lúa. Món quà lưu niệm mang đậm nét văn hóa lúa nước của đồng bào Khmer Nam Bộ." },
    { n: "Gùi trung (Phổ biến)", p: "350.000 – 600.000 VNĐ", img: "https://upload.wikimedia.org/wikipedia/commons/c/c9/The_papoose_of_people_Ede.jpg", d: "Vật dụng quen thuộc trên cánh đồng. Chiếc gùi Khmer có dáng bầu bĩnh, đan dày dặn, chứa đựng sự no ấm của mùa màng bội thu." },
    { n: "Gùi lớn/Tinh xảo", p: "800.000 – 1.500.000 VNĐ", img: "https://cdn.baogialai.com.vn/images/881770e9a829e196090410b8e66bdb2a7afebd841fa0023e2d438c1a82f9c6602f9fd50cd599080dc0afdeafc4d978a26b57fcd4937b5d10f3b511e7d5d0ec64/images1037263_44gui1.gif", d: "Những chiếc gùi được đan bởi nghệ nhân lão làng, hoa văn nổi tinh tế. Đây là niềm tự hào của gia chủ, thường dùng trong các dịp lễ tết quan trọng." }
  ]},
  { e: "KHƠ MÚ", items: [
    { n: "Nhạc cụ Đao Đao (Phổ thông)", p: "150.000 – 300.000 VNĐ", img: "https://dantocmiennui-media.baotintuc.vn/images/57c5aab70c5efc5a98d240302ffc6edbfca596afee0f858145c35e6ee61658a8aaec2b4361bd921c2900d8e534226f4b/k1-2.jpg", d: "Ống tre tự nhiên, khi vỗ tạo ra âm thanh 'đao đao' vui nhộn. Nhạc cụ đơn giản nhưng mang lại niềm vui bất tận cho trẻ nhỏ và người già." },
    { n: "Nhạc cụ Đao Đao (Nghệ nhân)", p: "400.000 – 600.000 VNĐ", img: "https://dantocmiennui-media.baotintuc.vn/images/57c5aab70c5efc5a98d240302ffc6edbc17fd3529f80cdb375172f4920d73776a20fe7c16550bf7e66d29dda31abc836/k4-2.JPG", d: "Được chế tác, căn chỉnh âm thanh kỹ lưỡng. Tiếng 'đao đao' vang, giòn, hòa quyện hoàn hảo trong dàn nhạc dân gian Khơ Mú." }
  ]},
  { e: "LA CHÍ", items: [
    { n: "Đan lát", p: "Từ 30.000 VNĐ", img: "https://s-aicmscdn.vietnamhoinhap.vn/vnhn-media/18/7/20/nghe-dan-lat.jpg", d: "Sản phẩm mây tre đan bền bỉ, phục vụ đời sống tự cung tự cấp trên vùng cao. Mỗi chiếc giỏ, chiếc rổ là kết quả của sự tỉ mỉ những ngày nông nhàn." },
    { n: "Trang sức", p: "Từ 380.000 VNĐ", img: "https://baotanglichsu.vn/DataFiles/Uploaded/image/data%20Hung/thang%207%20nam%202014/sac%20mau%20nguoi%20dan%20toc%20la%20chi/2.jpg", d: "Vòng cổ, vòng tay bằng bạc chạm khắc đơn giản nhưng tinh tế. Nó là bùa hộ mệnh, bảo vệ người La Chí khỏi gió độc và tà ma." }
  ]},
  { e: "LA HA", items: [
    { n: "Rượu cần (Bình nhỏ 4-5L)", p: "220.000 – 250.000 VNĐ", img: "https://bizweb.dktcdn.net/thumb/1024x1024/100/530/543/products/87885526-2806409242760133-6368219602589057024-n-44a9a751-ca38-47ca-8698-c33339d1ccc4.jpg?v=1749308725590", d: "Bình rượu nhỏ gọn cho những cuộc vui đầm ấm. Hương men lá rừng nồng nàn gắn kết tình cảm gia đình, bạn bè." },
    { n: "Rượu cần (Bình trung 6-10L)", p: "300.000 – 480.000 VNĐ", img: "https://www.vangdanh.com/wp-content/uploads/2024/04/ruou-can-dac-san-avatar-2.jpg", d: "Lựa chọn hoàn hảo cho những bữa tiệc đãi khách. Vị rượu ngọt đằm, càng uống càng say lòng người." },
    { n: "Rượu cần (Bình đại 20-30L)", p: "800.000 – 1.300.000 VNĐ", img: "https://amthucxanh.vn/wp-content/uploads/2021/05/ruou-can-tay-bac-8.jpg", d: "Bình rượu khổng lồ cho lễ hội lớn của bản. Cần rượu vít cong mời gọi cả cộng đồng cùng chung vui, say trong tiếng cồng chiêng." }
  ]},
  { e: "LA HỦ", items: [
    { n: "Sáo Í La La (Phổ thông)", p: "150.000 – 250.000 VNĐ", img: "https://dotchuoinon.com/wp-content/uploads/2015/04/lhu_cc3b4-gc3a1i-la-he1bba7-say-sc6b0a-ge1bb8di-be1baa1n-tc3acnh-be1bab1ng-tie1babfng-sc3a1o-du-dc6b0c6a1ng.jpg", d: "Tiếng sáo gọi mùa xuân của người La Hủ. Âm thanh trong trẻo như tiếng chim rừng, mang theo ước vọng về một năm mới ấm no." },
    { n: "Sáo Í La La (Chế tác kỹ)", p: "300.000 – 500.000 VNĐ", img: "https://dotchuoinon.com/wp-content/uploads/2015/04/lhu_me1bb8di-ngc6b0e1bb9di-trong-be1baa3n-ve1baabn-quc3a2y-que1baa7n-c491e1bb83-the1bb95i-sc3a1o-vui-ve1babb.jpg", d: "Cây sáo quý được làm từ trúc già, lỗ bấm chính xác. Đây là người bạn tri kỷ của các nghệ nhân, thổi hồn vào những giai điệu núi rừng biên cương." }
  ]},
  { e: "LÀO", items: [
    { n: "Mắm cá Padek", p: "60.000 - 120.000 VNĐ", img: "https://khamphahue.com.vn/Portals/0/Medias/Nam2020/T6/Khamphahue_Dac-san-a-Luoi_Mam-ca-Paderk.jpg", d: "Gia vị 'linh hồn' trong ẩm thực người Lào. Mắm cá Padek mặn mòi, đậm đà, nêm nếm vào món ăn nào cũng dậy mùi thương nhớ quê hương." },
    { n: "Thìa/Muỗng (từ vỏ bom)", p: "100.000 – 250.000 VNĐ", img: "https://tourhot24h.vn/wp-content/uploads/2024/03/qua-luu-niem-lao.png", d: "Từ tàn tích chiến tranh, người dân Lào đã tái chế thành vật dụng hòa bình. Chiếc thìa nhôm đúc thủ công mang thông điệp mạnh mẽ về sự hồi sinh từ tro tàn." },
    { n: "Vòng tay (từ vỏ bom)", p: "200.000 – 600.000 VNĐ", img: "https://tourhot24h.vn/wp-content/uploads/2024/03/qua-luu-niem-lao.png", d: "Vòng tay đúc từ vỏ bom, khắc họa tiết truyền thống. Một món trang sức độc đáo, vừa cá tính vừa mang ý nghĩa lịch sử sâu sắc." },
    { n: "Búp bê voi (Lưu niệm)", p: "30.000 – 700.000 VNĐ", img: "https://tourhot24h.vn/wp-content/uploads/2024/03/qua-luu-niem-lao-bup-be-voi.png", d: "Những chú voi vải ngộ nghĩnh, biểu tượng của đất nước Triệu Voi. Món quà dễ thương mang lại may mắn và sức mạnh." }
  ]},
  { e: "LÔ LÔ", items: [
    { n: "Sản phẩm thêu", p: "Từ 300.000 VNĐ", img: "https://imgcdn.tapchicongthuong.vn/thumb/w_1920/tcct-media/23/9/18/tinh-xao-nghe-theu-cua-nguoi-lo-lo_65086b4c0ab46.jpg", d: "Kỹ thuật thêu ghép vải (patchwork) đỉnh cao của người Lô Lô. Những mảng màu rực rỡ được ghép nối tỉ mỉ tạo nên bức tranh trừu tượng đầy mê hoặc." },
    { n: "Trống đồng", p: "Từ 700.000 VNĐ", img: "https://cdn.tienphong.vn/images/a6bf4f60924201126af6849ca45a398089773d38c0d1721924aef5dbd6b922d4a054e0edd71a7226910b349a91dacef150a2364b21c83afb5f4706b33da6e3b5/tempimagetivbep-2918.jpg", d: "Biểu tượng thiêng liêng kết nối trời và đất. Trống đồng Lô Lô là báu vật gia truyền, tiếng trống vang lên trong lễ cúng tổ tiên, cầu mong sự bảo trợ của thần linh." }
  ]},
  { e: "LỰ", items: [
    { n: "Túi đeo thổ cẩm", p: "200.000 – 500.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/tho-cam-dan-toc/tui-tho-cam/tui-tho-cam-2.jpeg", d: "Chiếc túi nhỏ duyên dáng với họa tiết quả trám đặc trưng. Phụ kiện hoàn hảo để tôn lên vẻ đẹp mộc mạc mà tinh tế." },
    { n: "Vải dệt thô", p: "200.000 – 400.000 VNĐ/mét", img: "https://khankm0.com/media/uploads/TC2023/v%E1%BA%A3i/vai-tho-cam-tphcm%20(13).jpg", d: "Chất liệu vải bông tự nhiên, nhuộm chàm thủ công. Vải thô mộc, thoáng mát, mang màu sắc trầm mặc của núi rừng Tây Bắc." },
    { n: "Khăn đội đầu (Pha phong)", p: "300.000 – 600.000 VNĐ", img: "https://media.vov.vn/sites/default/files/styles/large/public/2024-05/lu2_mpfy.jpg", d: "Chiếc khăn thêu hoa văn cầu kỳ, là điểm nhấn quan trọng nhất trên trang phục người phụ nữ Lự, thể hiện sự khéo léo và nết na." },
    { n: "Áo (Xưa)", p: "800.000 – 1.500.000 VNĐ", img: "https://media.daidoanket.vn/w1200/uploaded/images/2025/09/09/8b615b2a-921f-4e61-96ac-bdbf7da870a8.jpg", d: "Những chiếc áo cổ truyền may theo lối xưa, đính hàng cúc bạc và thêu hoa văn tinh xảo. Một tác phẩm nghệ thuật may mặc gìn giữ hồn cốt dân tộc." },
    { n: "Váy (Sín)", p: "1.500.000 – 3.000.000 VNĐ", img: "https://media.vov.vn/sites/default/files/styles/large/public/2024-05/lu3_wokf.jpg", d: "Chiếc váy hai tầng độc đáo với phần chân váy thêu dày đặc hoa văn. Khi bước đi, váy xòe ra như bông hoa rừng đang nở." }
  ]},
  { e: "MẠ", items: [
    { n: "Túi xách, ví, vải dệt", p: "50.000 – 300.000 VNĐ", img: "https://craftlink.com.vn/wp-content/uploads/2021/09/DSC_0156-scaled.jpg", d: "Những phụ kiện nhỏ xinh dệt từ sợi bông, mang hoa văn hình học đặc trưng của người Mạ. Món quà ý nghĩa, mang nét văn hóa đại ngàn." },
    { n: "Gùi mini (Lưu niệm)", p: "150.000 – 200.000 VNĐ", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lg2h470fe8h66f_tn.webp", d: "Chiếc gùi nhỏ nhắn, mô phỏng chính xác gùi thật. Một món đồ trang trí độc đáo, gợi nhớ về cuộc sống nương rẫy thanh bình." },
    { n: "Khăn choàng thổ cẩm", p: "250.000 – 500.000 VNĐ", img: "https://chus.vn/images/detailed/288/10038_34_F1.jpg", d: "Tấm khăn dệt dày dặn, ấm áp. Hoa văn trắng nổi bật trên nền chàm đen tạo nên vẻ đẹp sang trọng, cổ điển." },
    { n: "Gùi hoa văn (Gùi đi hội)", p: "500.000 – 800.000 VNĐ", img: "https://dantocmiennui-media.baotintuc.vn/images/5c0c54f95c9777a45a8f5910a7a986a5eadc21e57187dd2933c144a25095343f41a7ade5047008cab0335126d30faed060066eceff44e1b72e5e52cb583452f5/gui-1-1.jpg.webp", d: "Chiếc gùi đẹp nhất của người con gái Mạ khi đi lễ hội. Nó đựng váy áo đẹp, trang sức và cả niềm vui phơi phới của tuổi trẻ." },
    { n: "Tấm đắp dệt thủ công", p: "800.000 – 5.000.000 VNĐ (Tùy độ tinh xảo)", img: "https://craftlink.com.vn/wp-content/uploads/2021/09/DSC_0156-scaled.jpg", d: "Tấm chăn (Ui) dệt công phu, là của hồi môn quý giá. Nó che chở giấc ngủ, sưởi ấm gia đình qua những đêm đông lạnh giá trên cao nguyên." }
  ]},
  { e: "MẢNG", items: [
    { n: "Sản phẩm mây tre đan", p: "Từ 150.000 VNĐ trở lên", img: "https://images.baodantoc.vn/uploads/banchuyende/2024/LAI%20CHAU/70tr/bai-3/anh-1-1.jpg", d: "Sống ven sông nước, người Mảng đan lát rất giỏi. Các sản phẩm từ mây tre như giỏ cá, nơm, gùi đều rất tinh xảo, bền đẹp, phục vụ đắc lực cho việc đánh bắt và hái lượm." }
  ]},
  { e: "M'NÔNG", items: [
    { n: "Trang sức", p: "Từ 50.000 VNĐ", img: "https://dantocmiennui-media.baotintuc.vn/images/57c5aab70c5efc5a98d240302ffc6edbe2ea33c18f2ada3ea6902a66d7c3e99388908afb016b147a5b833391c48042ce/m5-1.jpg", d: "Vòng cổ, vòng tay bằng đồng, bạc, hạt cườm... không chỉ làm đẹp mà còn thể hiện sức mạnh và quyền uy của người M'Nông." },
    { n: "Gùi", p: "Từ 150.000 VNĐ", img: "https://media.sketchfab.com/models/dad2b1377b8b41269b77f69e5d270a38/thumbnails/95730f946af14f65acc3753f97806b27/35a4287986484a6b9633c9d62948176d.jpeg", d: "Chiếc gùi thân thuộc, gắn bó với người M'Nông như hình với bóng. Gùi theo người lên rẫy, gùi theo người đi săn voi, chứa đựng cả cuộc sống sinh tồn." },
    { n: "Thổ cẩm", p: "Từ 400.000 VNĐ", img: "https://binhphuoc.gov.vn/uploads/binhphuoc/dulich/2023_05/det-tho-cam-6.jpg", d: "Sắc đỏ đen chủ đạo mạnh mẽ. Thổ cẩm M'Nông dày dặn, bền bỉ, mang vẻ đẹp hoang sơ và phóng khoáng như chính con người nơi đây." }
  ]},
  { e: "MƯỜNG", items: [
    { n: "Thổ cẩm (Tân Sơn)", p: "Từ 30.000 VNĐ trở lên", img: "https://images.baodantoc.vn/uploads/2023/Thang-12/Ngay-10/Manh-Ha/2023-12-5-N%E1%BB%97%20l%E1%BB%B1c%20h%E1%BB%93i%20sinh%20ngh%E1%BB%81%20d%E1%BB%87t%20th%E1%BB%95%20c%E1%BA%A9m%20c%E1%BB%A7a%20%C4%91%E1%BB%93ng%20b%C3%A0o%20d%C3%A2n%20t%E1%BB%99c%20M%C6%B0%E1%BB%9Dng%20huy%E1%BB%87n%20T%C3%A2n%20S%C6%A1n-%E1%BA%A2nh%203.jpg", d: "Đặc sắc nhất là cạp váy Mường với hoa văn rồng, phượng, hươu, nai... được dệt tỉ mỉ. Đó là cả một thế giới quan thu nhỏ quấn quanh eo người phụ nữ." },
    { n: "Chiêng tiểu (20-30cm)", p: "2.500.000 – 4.500.000 VNĐ", img: "https://nhn.1cdn.vn/2023/08/05/img_8106.jpg" , d: "Chiếc chiêng nhỏ, âm thanh trong trẻo, thường dùng để giữ nhịp hoặc chơi các giai điệu vui tươi trong dàn chiêng Mường." },
    { n: "Chiêng trung (40-55cm)", p: "6.000.000 – 12.000.000 VNĐ", img: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/8/4/1076949/3-TB-922631-03.jpg", d: "Linh hồn của dàn chiêng. Tiếng chiêng trung trầm ấm, vang vọng, kết nối các bè trầm và bổng, tạo nên sự hòa quyện tuyệt vời." },
    { n: "Chiêng đại (>60cm)", p: "15.000.000 – 30.000.000 VNĐ", img: "https://maichauhideaway.com/Data/Sites/1/News/430/c%E1%BB%93ng-chi%C3%AAng-ng%C6%B0%E1%BB%9Di-m%C6%B0%E1%BB%9Dng-(2).png", d: "Chiếc chiêng lớn nhất, quyền uy nhất. Tiếng chiêng đại rền vang như sấm, thể hiện sức mạnh của nhà Lang và sự phồn thịnh của bản Mường." }
  ]},

  // 36-41
  { e: "NÙNG", items: [
    { n: "Hương sạch (Nhang)", p: "5.000 – 10.000 VNĐ/nén", img: "https://lamgiau.laodongthudo.vn/stores/news_dataimages/2023/032023/13/23/540c667da0e75205fd6dc9e0afc46467.jpg", d: "Hương làm từ thảo mộc thiên nhiên, không hóa chất. Mùi thơm dịu nhẹ, thanh khiết, dâng lên tổ tiên tấm lòng thành kính nhất." },
    { n: "Sản phẩm vải chàm", p: "Từ 150.000 VNĐ", img: "https://scontent.iocvnpt.com/resources/portal/Images/CBG/hongsoncbg/542227f37fd3f08da9c27_605091245.jpg", d: "Màu chàm thâm trầm, bền bỉ như người Nùng. Vải nhuộm thủ công nhiều lần nước chàm, có mùi thơm đặc trưng, càng mặc càng mềm mại." },
    { n: "Chạm bạc", p: "Từ 400.000 VNĐ", img: "https://scov.gov.vn/upload/2005660/20210923/d5aef07799019eaca8e68b7388efef33img_0518.jpg", d: "Nghề chạm bạc Nùng Phản Slin tinh xảo nức tiếng. Từng nét chạm khắc hình hoa lá, chim muông trên bạc trắng tinh khôi thể hiện tài hoa bậc thầy." }
  ]},
  { e: "Ơ ĐU", items: [
    { n: "Rượu cần Ơ Đu", p: "Từ 350.000 VNĐ trở lên", img: "https://www.vangdanh.com/wp-content/uploads/2024/04/ruou-can-dac-san-avatar-3.jpg", d: "Hương vị đặc biệt của tộc người ít người nhất Việt Nam. Rượu ủ từ men lá rừng bí truyền, uống vào nghe như tiếng sấm đầu mùa gọi sự sống sinh sôi." }
  ]},
  { e: "PÀ THẺN", items: [
    { n: "Sản phẩm dệt thổ cẩm (Ván Chi)", p: "Từ 150.000 VNĐ trở lên", img: "https://baohagiang.vn/file/4028eaa4679b32c401679c0c74382a7e/042024/dua_sac_mau_1_20240417094932.jpg", d: "Sắc đỏ rực rỡ như lửa. Thổ cẩm Pà Thẻn nổi bật với màu đỏ chủ đạo, tượng trưng cho thần Lửa, mang lại may mắn và sức sống mãnh liệt." }
  ]},
  { e: "PHÙ LÁ", items: [
    { n: "Nhạc cụ \"Cúc kẹ\" (Sáo mũi)", p: "200.000 – 500.000 VNĐ", img: "https://cdn.baolaocai.vn/images/a55fab73fc22a03d0e5e6d06fcff08fde3ddfa1e2ac7f5da86b4fcee2f97d240a2261f7a3cb18c5a8083f50b30d02d338c91794c3be7daf08be5fcc2acf4587b/ts.jpg", d: "Nhạc cụ độc đáo thổi bằng mũi. Âm thanh Cúc kẹ êm ái, nhẹ nhàng như lời thì thầm tâm sự, chứa đựng nỗi niềm sâu kín của người Phù Lá." }
  ]},
  { e: "RA GLAI", items: [
    { n: "Đàn Chapi truyền thống", p: "80.000 – 1.000.000 VNĐ", img: "https://images.baodantoc.vn/uploads/2024/Thang-8/Ngay-4/Thuan/z57010.jpg", d: "'Ai nghèo cũng có cây đàn Chapi'. Cây đàn tre đơn sơ nhưng chứa đựng cả tâm hồn phóng khoáng của người Ra Glai, tiếng đàn như tiếng lòng người nghệ sĩ núi rừng." }
  ]},
  { e: "RƠ MĂM", items: [
    { n: "Gùi mini (Lưu niệm)", p: "150.000 – 250.000 VNĐ", img: "https://product.hstatic.net/200000106437/product/gui_tay_nguyen_kich_thuoc_trung_trang_tri_ban_an_an_tuong_59ccb0acff8a4c56aa27dd0c12682ec3_1024x1024.jpg", d: "Phiên bản nhỏ nhắn, đáng yêu của chiếc gùi Rơ Măm. Món quà lưu niệm độc đáo, mang nét văn hóa của một trong những dân tộc ít người nhất Tây Nguyên." },
    { n: "Gùi thô (Lao động)", p: "300.000 – 500.000 VNĐ", img: "https://dantra.vn/uploads/san-pham/tho-cam-dan-toc/gui-dan-toc/gui-dan-toc-6.jpg", d: "Chiếc gùi mộc mạc, bền bỉ. Được đan lát chắc chắn để chịu được sức nặng của lúa, ngô và những chuyến đi rừng dài ngày." },
    { n: "Gùi hoa văn (Trang trí)", p: "600.000 – 1.200.000 VNĐ", img: "https://baothainguyen.vn/file/oldimage/baothainguyen/UserFiles/image/3%20(1).jpg", d: "Tuyệt tác đan lát với kỹ thuật cài nan tạo hoa văn hình học. Chiếc gùi không chỉ là vật dụng mà là niềm kiêu hãnh về sự khéo léo của người Rơ Măm." }
  ]},

  // 42-50
  { e: "SÁN DÌU", items: [
    { n: "Trang phục truyền thống phụ nữ", p: "Từ 150.000 VNĐ", img: "https://i.ytimg.com/vi/JmwKw7blNBw/maxresdefault.jpg", d: "Chiếc áo dài màu chàm giản dị, kết hợp với váy xòe và khăn đội đầu. Vẻ đẹp đằm thắm, kín đáo của phụ nữ Sán Dìu được tôn lên qua từng nếp vải." }
  ]},
  { e: "SI LA", items: [
    { n: "Đàn tính tẩu", p: "800.000 – 1.500.000 VNĐ", img: "https://product.hstatic.net/200000903353/product/6_fe6f8d3263b34a72992ddeab0db7b253_master.jpg", d: "Cây đàn 2 dây bầu tròn, âm thanh trong trẻo. Tiếng đàn tính tẩu hòa cùng điệu hát giao duyên là nét văn hóa đặc sắc của người Si La nơi biên cương." }
  ]},
  { e: "TÀ ÔI", items: [
    { n: "Sản phẩm dệt từ Zèng (Lưu niệm/Gia dụng)", p: "50.000 – 300.000 VNĐ", img: "https://cly.1cdn.vn/2023/11/13/20.jpg", d: "Dệt Zèng là di sản văn hóa quốc gia. Những hạt cườm được dệt trực tiếp vào sợi vải tạo nên hoa văn nổi độc đáo, mang vẻ đẹp sang trọng và quý phái." }
  ]},
  { e: "TÀY", items: [
    { n: "Miến dong Bình Liêu", p: "Từ 30.000 VNĐ", img: "https://data3.ikitech.vn/images/SHImages/v2/720/webp/epuENPSrLw1749456468.webp", d: "Sợi miến dai giòn làm từ củ dong riềng trồng trên núi đá. Hương vị thanh mát, không hóa chất, mang đậm phong vị ẩm thực người Tày vùng biên ải." },
    { n: "Thổ cẩm (Mặt pha)", p: "300.000 – 1.500.000 VNĐ", img: "https://www.dulichvn.org.vn/nhaptin/uploads/images/2021/Thang12/712Lao-Cai-Nghe-det-tho-cam-cua-nguoi-Tay-vung-Nghia-Do2.jpg", d: "Mặt chăn thổ cẩm dệt hoa văn hình quả trám, hình móc câu. Màu sắc hài hòa, trang nhã, là vật dụng không thể thiếu trong ngày cưới của cô gái Tày." },
    { n: "Đàn Tính (Tính Tẩu)", p: "600.000 – 1.500.000 VNĐ", img: "https://product.hstatic.net/200000903353/product/1_a2dfdf03f8b74b83ab7ff054d2d5fcf8_master.jpg", d: "'Đàn Tính ba dây'. Cây đàn linh thiêng của các ông Then bà Then, là cầu nối giữa cõi trần và Mường Trời, mang lời cầu phúc an lành cho bản làng." }
  ]},
  { e: "THÁI", items: [
    { n: "Đan lát", p: "Từ 30.000 VNĐ", img: "https://dacsantaybac.vn/wp-content/uploads/2025/01/Cac-buoc-lam-gio-dung-ca-o-Tay-Bac-Anh-suu-tam.jpg", d: "Những chiếc ép khẩu đựng xôi, ớp đựng cá được đan khéo léo từ tre nứa. Vừa tiện dụng vừa mang vẻ đẹp thẩm mỹ dân gian tinh tế." },
    { n: "Thổ cẩm", p: "Từ 50.000 VNĐ", img: "https://maichauhideaway.com/Data/Sites/1/media/tin-tuc/%E1%BA%A3nh-b%C3%A0i-vi%E1%BA%BFt/t22025/hoa-tiet-tho-cam-dan-toc-thai/hoa-tiet-tho-cam-dan-toc-thai-2.jpg", d: "Nổi tiếng nhất là khăn Piêu thêu tay cầu kỳ. Từng đường chỉ thêu 'luồn rừng' thể hiện sự khéo léo, kiên nhẫn và tình yêu của cô gái Thái gửi gắm vào đó." },
    { n: "Pí (Sáo)", p: "Từ 250.000 VNĐ", img: "https://imagevietnam.vnanet.vn/Upload//2013/1/25/25-1KPVN4BaoAnh25120139472744.jpg", d: "Tiếng Pí nỉ non, da diết như tiếng lòng người đang yêu. Cây sáo trúc đơn sơ nhưng có sức lay động lòng người mãnh liệt." }
  ]},
  { e: "THỔ", items: [
    { n: "Xập xèng (Thanh la)", p: "500.000 – 1.200.000 VNĐ", img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lkxliy90vrodb4", d: "Nhịp phách rộn ràng của lễ hội. Tiếng xập xèng hòa cùng tiếng trống, tiếng cồng tạo nên không khí tưng bừng, xua tan mệt nhọc." },
    { n: "Trống (Cái/Con)", p: "2.500.000 – 6.000.000 VNĐ", img: "https://images.baodantoc.vn/uploads/2022/Th%C3%A1ng%204/Ng%C3%A0y%202/TRUNG/Ngh%E1%BB%87%20An/1.jpg" , d: "Trống da trâu bịt kín hai mặt, âm thanh trầm hùng. Tiếng trống Thổ vang lên là báo hiệu mùa lễ hội, là nhịp đập trái tim của cộng đồng." },
    { n: "Chiêng (Cồng)", p: "3.500.000 – 8.000.000 VNĐ", img: "https://image.vovworld.vn/w500/Uploaded/vovworld/thpsplu/2020_06_29/154507_7_HZXI.jpg", d: "Cồng chiêng không chỉ là nhạc cụ mà là vật thiêng. Người Thổ quý chiêng như con, giữ gìn cẩn thận và chỉ mang ra đánh vào những dịp trọng đại." }
  ]},
  { e: "XINH MUN", items: [
    { n: "Gối đầu (Thêu thủ công)", p: "100.000 – 450.000 VNĐ", img: "https://www.vwu.vn/documents/1809139/0/thocam+xinmun+2.jpg/b5c7da95-9ca2-4f0f-97e8-0a21a2d7ae22", d: "Chiếc gối thêu hoa văn sặc sỡ ở hai đầu. Đây là quà tặng ý nghĩa của cô dâu biếu bố mẹ chồng, thể hiện lòng hiếu thảo và tài nữ công gia chánh." },
    { n: "Khăn đội đầu (Thêu tinh xảo)", p: "150.000 – 600.000 VNĐ", img: "https://vov4.vov.vn/sites/default/files/styles/large_watermark/public/2023-09/img20190817145913.jpg", d: "Khăn đội đầu thêu hoa văn cây thông, hình thoi... Là điểm nhấn duyên dáng trên mái tóc người phụ nữ Xinh Mun, che chở và làm đẹp cho người đội." }
  ]},
  { e: "XƠ ĐĂNG", items: [
    { n: "Bún gạo đỏ", p: "40.000 – 65.000 VNĐ/kg", img: "https://tmangdeeng.vn/wp-content/uploads/2024/10/b1b7e7133e2e8670df3f9.jpg", d: "Sợi bún dai ngon làm từ gạo lúa rẫy đỏ (gạo huyết rồng). Hương vị đậm đà, giàu dinh dưỡng, mang màu sắc của đất đỏ Tây Nguyên." },
    { n: "Đàn T'rưng", p: "Từ 120.000 VNĐ", img: "https://nhaccuphongvan.vn/wp-content/uploads/2016/01/dan-trung-12-ong-3-400x400.jpg", d: "Dàn nhạc nước chảy. Những ống nứa to nhỏ ghép lại, khi gõ tạo ra âm thanh thánh thót như tiếng suối róc rách, tiếng thác đổ, mang cả âm hưởng đại ngàn vào nhà." },
    { n: "Đồ dùng từ vỏ cây", p: "1.500.000 – 4.000.000 VNĐ", img: "https://cly.1cdn.vn/2024/07/03/img_20240703_190204.jpg", d: "Sản phẩm độc đáo từ vỏ cây rừng đập dập, ngâm bùn. Tấm chăn, chiếc áo vỏ cây gợi nhớ về thuở sơ khai, là minh chứng cho khả năng sáng tạo phi thường của người Xơ Đăng." }
  ]},
  { e: "XTIÊNG", items: [
    { n: "Ntố (Nia)", p: "Từ 50.000 VNĐ", img: "https://media.baobinhphuoc.com.vn/upload/news/11_2022/h2_19502907112022.jpg", d: "Chiếc nia tròn trịa đan bằng tre, dùng để sảy gạo, phơi nông sản. Vật dụng quen thuộc gắn liền với hạt gạo dẻo thơm nuôi sống buôn làng." },
    { n: "Sor (Gùi)", p: "Từ 150.000 VNĐ", img: "https://media.baobinhphuoc.com.vn/upload/news/11_2022/h1_19501907112022.jpg", d: "Gùi Xtiêng có dáng thon gọn, đáy vuông vững chãi. Là người bạn đồng hành không thể thiếu trong mỗi chuyến đi rừng, đi rẫy của bà con." },
    { n: "Thổ cẩm", p: "Từ 250.000 VNĐ", img: "https://dotchuoinon.com/wp-content/uploads/2015/05/xt_le1bb85-he1bb99i-bombo3.jpg?w=768", d: "Nghề dệt thổ cẩm Xtiêng nổi tiếng với các hoa văn mô phỏng thiên nhiên sinh động. Tấm vải bền chắc, màu sắc hài hòa, ấm áp như tình người Bình Phước." }
  ]}
];

// Mở rộng dữ liệu để có nhiều item hơn cho việc test phân trang
const allProducts: Product[] = rawData.flatMap((grp, grpIdx) => 
  grp.items.map((item: any, idx) => ({
    id: `${grp.e}-${idx}`,
    ethnic: grp.e,
    name: item.n,
    price: item.p,
    // Sử dụng mô tả chi tiết từ dữ liệu mới, nếu không có thì dùng mô tả mặc định chất lượng cao hơn
    desc: item.d || `Sản phẩm ${item.n} là kết tinh văn hóa của dân tộc ${grp.e}, được chế tác thủ công tỉ mỉ, mang đậm dấu ấn núi rừng và tâm hồn người bản địa.`,
    artisan: "", 
    exp: `${5 + Math.floor(Math.random() * 20)} năm nghề`,
    sold: Math.floor(Math.random() * 500) + 10,
    category: 'craft',
    img: (item.img && item.img !== "gắn hình vào đây") ? item.img : getImageForProduct(item.n, grpIdx * 10 + idx)
  }))
);

// ==========================================
// COMPONENTS
// ==========================================

const ProductCard = React.memo(({ product, onOpenDetail }: { product: Product, onOpenDetail: (p: Product) => void }) => (
  <div className="group rounded-2xl md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_rgba(209,77,77,0.15)] hover:-translate-y-2 border border-gold/10 bg-white flex flex-col h-full">
    {/* Tăng chiều cao khung ảnh lên h-72 (khoảng 288px) để ảnh to hơn */}
    <div className="relative h-40 md:h-72 overflow-hidden shrink-0 cursor-pointer bg-[#F9F7F2]" onClick={() => onOpenDetail(product)}>
      <img 
        src={product.img} 
        alt={product.name} 
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
      />
      <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-primary/90 text-white text-[8px] md:text-[9px] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm border border-gold/30 shadow-md">
        {product.ethnic}
      </div>
      {/* Overlay "Tìm hiểu" khi hover ảnh */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
         <span className="bg-white text-primary px-3 md:px-6 py-1.5 md:py-2.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transform scale-90 group-hover:scale-100 transition-transform shadow-lg hidden md:block">Xem chi tiết</span>
      </div>
    </div>
    
    <div className="p-3 md:p-6 text-left flex-grow flex flex-col">
      <h3 
        className="text-sm md:text-lg font-black text-text-main tracking-tight mb-1 md:mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2 min-h-[2.5rem] md:min-h-[3.5rem]"
        onClick={() => onOpenDetail(product)}
      >
        {product.name}
      </h3>
      
      <div className="mt-auto pt-2 md:pt-4 border-t border-gold/5 space-y-2 md:space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-primary font-black text-sm md:text-lg">{product.price}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-3">
           <button 
             onClick={() => onOpenDetail(product)}
             className="border border-gold/30 rounded-lg md:rounded-xl py-2 md:py-2.5 text-[8px] md:text-[10px] font-black uppercase text-text-soft hover:bg-gold/10 transition-colors"
           >
             Tìm hiểu
           </button>
           <button 
              onClick={() => onOpenDetail(product)}
              className="bg-primary rounded-lg md:rounded-xl py-2 md:py-2.5 text-[8px] md:text-[10px] font-black uppercase text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
             Đặt mua
           </button>
        </div>
      </div>
    </div>
  </div>
));

const ProductModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
        addToCart(product);
    }
    onClose();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
        addToCart(product);
    }
    onClose();
    toggleCart(); 
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-display">
      <div className="absolute inset-0 bg-text-main/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      {/* Modal được điều chỉnh: Rất rộng (95vw) và chiều cao cố định (85vh) để vừa vặn màn hình */}
      <div className="bg-white w-[95vw] h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 animate-slide-up flex overflow-hidden border-4 border-gold/20 flex-col md:flex-row">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 size-12 rounded-full bg-white/20 hover:bg-primary hover:text-white transition-colors flex items-center justify-center backdrop-blur-md border border-white/40 shadow-lg group">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">close</span>
        </button>

        {/* Cột Ảnh: Chiếm 70% chiều rộng, rất to cho ảnh ngang */}
        <div className="w-full md:w-[70%] h-2/5 md:h-full relative bg-[#F2EFE6] group border-b md:border-b-0 md:border-r border-gold/10">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50"></div>
        </div>

        {/* Cột Thông tin: Chiếm 30% còn lại, có thanh cuộn riêng */}
        <div className="w-full md:w-[30%] h-3/5 md:h-full flex flex-col bg-white relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
             <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4 border border-primary/20">
               Dân tộc {product.ethnic}
             </div>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-text-main leading-tight mb-3">{product.name}</h2>
             <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gold/10">
                <span className="text-xl md:text-2xl font-black text-primary">{product.price}</span>
                <div className="flex items-center gap-1 text-gold">
                   {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined text-xs md:text-sm font-variation-settings: 'FILL' 1">star</span>)}
                   <span className="text-text-soft text-xs font-bold ml-1">({product.sold})</span>
                </div>
             </div>
             
             <div className="prose prose-sm text-text-soft">
               <h4 className="font-black text-text-main uppercase text-xs mb-3 flex items-center gap-2">
                 <span className="w-1 h-4 bg-gold rounded-full"></span>
                 Câu chuyện sản phẩm
               </h4>
               <p className="italic leading-relaxed opacity-90 text-justify text-sm">"{product.desc}"</p>
               
               <div className="mt-6 p-4 bg-background-light rounded-xl border border-gold/10">
                  <p className="text-[10px] font-black uppercase text-bronze mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">verified</span>
                    Cam kết từ Sắc Nối
                  </p>
                  <p className="text-xs leading-relaxed text-text-main/80">Sản phẩm thủ công 100%, hỗ trợ sinh kế trực tiếp cho nghệ nhân bản địa.</p>
               </div>
             </div>
          </div>

          {/* Footer của Modal (Nút mua hàng) */}
          <div className="p-4 md:p-6 border-t border-gold/10 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
             <div className="flex items-center justify-between mb-4">
                <span className="font-black text-text-main text-xs uppercase tracking-widest">Số lượng:</span>
                <div className="flex items-center gap-3 bg-background-light rounded-full px-3 py-1.5 border border-gold/20">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-text-soft hover:text-primary w-6 h-6 flex items-center justify-center">-</button>
                   <span className="font-black w-6 text-center text-sm">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="text-text-soft hover:text-primary w-6 h-6 flex items-center justify-center">+</button>
                </div>
             </div>
             
             <div className="grid grid-cols-5 gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="col-span-2 py-3.5 rounded-xl border-2 border-primary text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                   <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="col-span-3 py-3.5 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                   Đặt hàng ngay
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- MAIN COMPONENT ---

const Marketplace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEthnic = (searchParams.get('ethnic') || 'TẤT CẢ').toUpperCase();
  
  const [selectedEthnic, setSelectedEthnic] = useState<string>(initialEthnic);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Cấu hình: 12 sản phẩm/trang
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setSelectedEthnic(initialEthnic);
    setCurrentPage(1);
  }, [initialEthnic]);

  const handleEthnicSelect = useCallback((ethnic: string) => {
    setSelectedEthnic(ethnic);
    setSearchParams({ ethnic });
    setCurrentPage(1);
  }, [setSearchParams]);

  const ethnicList = useMemo(() => {
    const list = Array.from(new Set(allProducts.map(p => p.ethnic)));
    return ['TẤT CẢ', ...list.sort((a, b) => a.localeCompare(b, 'vi'))];
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedEthnic !== 'TẤT CẢ') {
      result = result.filter(p => p.ethnic === selectedEthnic);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.ethnic.toLowerCase().includes(term)
      );
    }
    return result;
  }, [selectedEthnic, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-display bg-background-light relative overflow-x-hidden">
      
      {/* Decorative Side Patterns (Fixed) */}
      <div className="fixed left-0 top-0 bottom-0 w-32 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-[0.03] pointer-events-none hidden 2xl:block mix-blend-multiply z-0"></div>
      <div className="fixed right-0 top-0 bottom-0 w-32 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-[0.03] pointer-events-none hidden 2xl:block mix-blend-multiply z-0"></div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Main Container expanded to 96% width for large screens */}
      <div className="w-[96%] max-w-[1920px] mx-auto px-4 py-8 md:py-12 relative z-10">
        
        {/* Banner Hero */}
        <section className="relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden mb-8 md:mb-12 h-48 md:h-80 flex items-center shadow-2xl border-4 border-white">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://topsapa.vn/uploads/2023/04/07/nguoi-dan-o-cho-phien-bac-ha-rat-chat-phac-va-gian-di-mac-nh_cufz0_042151300.png')"}}
          >
            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 px-6 md:px-16 max-w-3xl text-left">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-2 md:mb-4 italic uppercase tracking-tighter drop-shadow-2xl">
              CHỢ <span className="text-gold">PHIÊN</span>
            </h2>
            <div className="flex items-start gap-4">
               <div className="w-1 md:w-1.5 h-8 md:h-12 bg-gold/80 rounded-full mt-1 shrink-0"></div>
               <p className="text-white text-xs md:text-xl lg:text-2xl font-bold italic tracking-tight opacity-90 drop-shadow-md leading-tight">
                 "Kết nối di sản với thương mại công bằng cho các nghệ nhân dân tộc thiểu số vùng cao Việt Nam."
               </p>
            </div>
          </div>
        </section>

        {/* Filter & Search Toolbar */}
        <div className="sticky top-20 md:top-24 z-40 mb-6 md:mb-10 space-y-4 md:space-y-6">
          {/* Search */}
          <div className="max-w-3xl mx-auto relative group">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/95 backdrop-blur border-2 border-gold/20 rounded-full py-3 md:py-4 px-8 pl-12 md:pl-14 text-text-main shadow-xl text-sm md:text-lg font-medium focus:outline-none focus:border-primary transition-all"
            />
            <span className="material-symbols-outlined absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gold text-xl md:text-2xl">search</span>
          </div>

          {/* Ethnic Filter (Responsive) */}
          <div className="bg-white/90 backdrop-blur p-2 rounded-2xl md:rounded-[2.5rem] border border-gold/20 shadow-lg flex items-center max-w-[95vw] md:max-w-[90vw] mx-auto">
             <div className="pl-4 md:pl-6 pr-4 hidden md:flex items-center gap-2 border-r border-gold/10 text-primary">
                <span className="material-symbols-outlined">filter_list</span>
                <span className="font-black text-xs uppercase tracking-widest whitespace-nowrap">Bộ lọc dân tộc</span>
             </div>
             <div ref={scrollRef} className="flex-1 flex overflow-x-auto gap-2 px-2 custom-scrollbar-h py-2 scroll-smooth">
                {ethnicList.map(ethnic => (
                  <button
                    key={ethnic}
                    onClick={() => handleEthnicSelect(ethnic)}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                      selectedEthnic === ethnic 
                      ? 'bg-primary border-primary text-white shadow-md' 
                      : 'bg-transparent border-transparent text-text-soft hover:bg-gold/10'
                    }`}
                  >
                    {ethnic}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Results Title */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between px-2 md:px-4 gap-4">
           <div className="flex items-center gap-3">
              <h3 className="text-lg md:text-2xl font-black text-text-main uppercase tracking-tighter italic">
                {selectedEthnic === 'TẤT CẢ' ? 'Toàn bộ di sản' : `Dân tộc ${selectedEthnic}`}
              </h3>
              <span className="bg-gold/20 text-text-main text-[10px] font-black px-2 py-0.5 rounded-md">
                {filteredProducts.length}
              </span>
           </div>
           
           <div className="text-[10px] md:text-xs font-bold text-bronze uppercase tracking-widest">
              Trang {currentPage} / {totalPages > 0 ? totalPages : 1}
           </div>
        </div>

        {/* Product Grid - Layout Responsive Cải Thiện */}
        {/* grid-cols-2: Mobile (2 sản phẩm) */}
        {/* md:grid-cols-3: Tablet/Large Phone/Ngang (3 sản phẩm) */}
        {/* lg:grid-cols-4: Desktop (4 sản phẩm) */}
        {/* Added 'content-start' to fix stretching when few items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 min-h-[600px] content-start">
          {currentProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={setSelectedProduct} />
          ))}
        </div>
        
        {/* Empty State */}
        {currentProducts.length === 0 && (
          <div className="py-20 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-gold/20">
             <span className="material-symbols-outlined text-6xl text-gold/30 mb-4">storefront</span>
             <p className="text-text-soft font-bold italic">Không tìm thấy sản phẩm nào phù hợp.</p>
             <button onClick={() => {setSearchTerm(''); setSelectedEthnic('TẤT CẢ')}} className="mt-4 text-primary font-black uppercase text-xs hover:underline">Xem tất cả</button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 md:mt-16 flex items-center justify-center gap-2 pb-20 lg:pb-0">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="size-8 md:size-10 rounded-full flex items-center justify-center border border-gold/20 bg-white text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            
            <div className="flex gap-1 md:gap-2 mx-2 md:mx-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                 if (page !== 1 && page !== totalPages && Math.abs(currentPage - page) > 1) {
                   if (Math.abs(currentPage - page) === 2) return <span key={page} className="text-gold/50 font-bold self-end text-xs">...</span>;
                   return null;
                 }
                 
                 return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`size-8 md:size-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${
                      currentPage === page 
                      ? 'bg-primary text-white shadow-lg scale-110' 
                      : 'bg-white border border-gold/10 text-text-soft hover:border-gold/50'
                    }`}
                  >
                    {page}
                  </button>
                 );
              })}
            </div>

            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="size-8 md:size-10 rounded-full flex items-center justify-center border border-gold/20 bg-white text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}

        <div className="h-24"></div>
      </div>

      <style>{`
        /* Ẩn scrollbar ngang cho menu mobile nhưng vẫn scroll được */
        .custom-scrollbar-h::-webkit-scrollbar { height: 0px; background: transparent; }
        
        .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #D14D4D; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D14D4D; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// Export rawData để Chatbot sử dụng
export { rawData as marketplaceData };
export default Marketplace;