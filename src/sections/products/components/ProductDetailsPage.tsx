import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  Box,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
  Stack,
  Typography,
  Divider,
  IconButton,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from '@mui/material';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

import {
  getProduct,
  updateProductJson,
  addProductImage,
  removeProductImage,
} from 'src/sections/products/api/productsApi';

// --- helpers ---
const formatFaDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(d);
  } catch {
    return d.toLocaleString('fa-IR');
  }
};

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { name?: string } };

  // ✅ RTL Pattern (طبق قاعده شما)
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prod, setProd] = useState<any | null>(null);

  // فرم
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await getProduct(productId);
      const ok = res?.success ?? true;
      if (!ok) toast.error(res?.message || 'دریافت محصول ناموفق بود.');
      const p = res?.result;
      setProd(p || null);
      setName(p?.name ?? '');
      setDescription(p?.description ?? '');
      setPrice(typeof p?.price === 'number' ? p.price : '');
      setCategoryId(typeof p?.categoryId === 'number' ? p.categoryId : '');
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت محصول');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSave = async () => {
    if (!productId || !name.trim() || price === '' || categoryId === '') {
      toast.error('نام، قیمت و دسته الزامی است.');
      return;
    }
    try {
      const res = await updateProductJson({
        productId,
        name: name.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        price: Number(price),
        status: 1,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'ذخیره شد.' : 'ذخیره ناموفق بود.');
      if (ok) {
        toast.success(msg);
        // ✅ بعد از موفقیت برگرد به لیست و درخواست رفرش بده
        nav('/dashboard/products', { state: { refetch: true } });
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ذخیره');
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file || !productId) return;
    try {
      const res = await addProductImage({ productId, image: file });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'تصویر اضافه شد.' : 'افزودن تصویر ناموفق بود.');
      if (ok) {
        toast.success(msg);
        load();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در آپلود تصویر');
    }
  };

  const handleRemoveImage = async (imageId: number | string) => {
    if (!productId) return;
    try {
      const res = await removeProductImage({
        productId,
        imageId: typeof imageId === 'string' ? Number(imageId) : imageId,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'تصویر حذف شد.' : 'حذف تصویر ناموفق بود.');
      if (ok) {
        toast.success(msg);
        load();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف تصویر');
    }
  };

  const title = state?.name || prod?.name || 'محصول';

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Box dir="rtl" sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              variant="outlined"
              color="inherit"
              onClick={() => nav(-1)}
            >
              بازگشت
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              ذخیره
            </Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="نمای کلی" />
            <Tab label="تصاویر" />
            <Tab label="دسته‌بندی" />
            <Tab label="سوال و جواب" />
            <Tab label="نظرات" />
          </Tabs>

          {/* Overview */}
          {tab === 0 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader title="اطلاعات محصول" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نام"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="قیمت"
                      type="number"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="توضیحات"
                      multiline
                      minRows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="شناسه دسته (CategoryId)"
                      type="number"
                      value={categoryId}
                      onChange={(e) =>
                        setCategoryId(e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                  </Grid>

                  {/* نمایش اطلاعات تکمیلی */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Chip label={`ایجاد: ${formatFaDate(prod?.inserTime)}`} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Chip
                      label={`آخرین بروزرسانی: ${prod?.lastUpdate ? formatFaDate(prod?.lastUpdate) : '—'}`}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {tab === 1 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader
                title="تصاویر محصول"
                action={
                  <Button component="label" startIcon={<UploadRoundedIcon />} variant="outlined">
                    بارگذاری تصویر
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                    />
                  </Button>
                }
              />
              <CardContent>
                {!prod?.images || (Array.isArray(prod.images) && prod.images.length === 0) ? (
                  <Stack spacing={2} alignItems="flex-start">
                    <Typography variant="body2" color="text.secondary">
                      هیچ تصویری ثبت نشده است.
                    </Typography>
                  </Stack>
                ) : (
                  <ImageList variant="masonry" cols={3} gap={12}>
                    {Array.isArray(prod.images) ? (
                      prod.images.map((img: any) => {
                        // انتظار: img.id و img.name (URL)
                        const imageUrl: string = img?.name || img?.url || '';
                        return (
                          <ImageListItem key={img.id || imageUrl}>
                            <img
                              src={imageUrl}
                              alt={prod?.name || 'product-image'}
                              loading="lazy"
                              style={{
                                borderRadius: 8,
                                width: '100%',
                                display: 'block',
                                objectFit: 'cover',
                                padding: 10,
                              }}
                            />
                            <ImageListItemBar
                              position="bottom"
                              actionIcon={
                                <IconButton
                                  sx={{ color: 'white' }}
                                  onClick={() => {
                                    if (confirm('این تصویر حذف شود؟')) {
                                      handleRemoveImage(img.id);
                                    }
                                  }}
                                  title="حذف تصویر"
                                >
                                  <DeleteOutlineRoundedIcon />
                                </IconButton>
                              }
                            />
                          </ImageListItem>
                        );
                      })
                    ) : (
                      <Typography variant="caption" color="warning.main">
                        ساختار تصاویر نامعتبر است.
                      </Typography>
                    )}
                  </ImageList>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category */}
          {tab === 2 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader title="دسته‌بندی" />
              <CardContent>
                <TextField
                  label="شناسه دسته (CategoryId)"
                  type="number"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Q&A */}
          {tab === 3 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader title="سوال و جواب محصول" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  این بخش جای‌گذاری شد. APIهای مربوط به Q&A را بده تا پیاده‌سازی کنم.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          {tab === 4 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader title="نظرات محصول" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  این بخش جای‌گذاری شد. APIهای مربوط به نظرات را بده تا تکمیل شود.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
