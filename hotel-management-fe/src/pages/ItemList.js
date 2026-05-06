import React, { useEffect, useState } from 'react';
import { itemApi } from '../api';
import ItemForm from '../components/ItemForm';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Trash2, Edit2 } from 'lucide-react';

function ItemList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await itemApi.getItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (item) => {
    try {
      await itemApi.createItem({
        MaDV: item.MaDV || 'DV' + Date.now(),
        TenDV: item.name || item.TenDV,
        DonGia: item.DonGia || 0,
      });
      toast({
        title: "Thành công",
        description: "Item đã được thêm",
      });
      loadItems();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await itemApi.deleteItem(id);
      toast({
        title: "Đã xóa",
        description: "Item đã được xóa",
      });
      loadItems();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa item",
        variant: "destructive",
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quản lý Item/Dịch vụ</h1>
      <ItemForm onAddItem={handleAddItem} />
      
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
          {items.map(item => (
            <li key={item._id} style={{ 
              padding: '10px', 
              marginBottom: '10px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{item.TenDV}</strong> - {item.DonGia?.toLocaleString('vi-VN')} VNĐ
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteItem(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ItemList;
