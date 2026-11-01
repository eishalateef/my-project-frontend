import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { STORE_CONFIGS, applyThemeClass, formatPrice as formatPriceUtil } from '../storeConfig';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const storeType = 'clothing';

  const [store, setStore] = useState(() => {
    try {
      const cached = sessionStorage.getItem('flexi_cached_store');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [availableAttributes, setAvailableAttributes] = useState(() => {
    try {
      const cached = sessionStorage.getItem('flexi_cached_attrs');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('flexi_cached_store');
    } catch {
      return true;
    }
  });

  // Fetch active main store on initial mount
  const fetchActiveStore = async () => {
    try {
      const res = await api.get('/api/store/active');
      if (res.data && res.data.store) {
        setStore(res.data.store);
        setAvailableAttributes(res.data.available_attributes || {});
        try {
          sessionStorage.setItem('flexi_cached_store', JSON.stringify(res.data.store));
          sessionStorage.setItem('flexi_cached_attrs', JSON.stringify(res.data.available_attributes || {}));
        } catch {}
      }
      applyThemeClass('clothing');
    } catch (err) {
      console.error('Failed to fetch active store from API:', err);
      applyThemeClass('clothing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveStore();
  }, []);

  const config = STORE_CONFIGS.clothing;

  const formatPrice = (amount) => {
    const symbol = store?.currency_symbol || config.currencySymbol;
    return formatPriceUtil(amount, 'clothing', symbol);
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        storeType: 'clothing',
        config,
        availableAttributes,
        allStores: store ? [store] : [],
        loading,
        switching: false,
        switchFeedback: null,
        permissions: {
          enable_store_switcher: false,
          is_developer_unlocked: false,
          default_store_type: 'clothing',
        },
        isSwitcherAllowed: false,
        refreshStore: fetchActiveStore,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
