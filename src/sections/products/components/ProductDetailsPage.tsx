import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Divider,
  TextField,
  ImageList,
  CardHeader,
  Typography,
  IconButton,
  CardContent,
  ImageListItem,
  ImageListItemBar,
  Theme,
  Autocomplete,
  CircularProgress,
} from '@mui/material';

import {
  getProduct,
  addProductImage,
  updateProductJson,
  getProductComments,
  removeProductImage,
  changeProductCommentStatus,
} from 'src/sections/products/api/productsApi';
import { GetCategoriesApi } from '../api/categoriesApi';

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
  const outerTheme = useTheme();

  const rtlTheme = useMemo(
    () => ({ ...(outerTheme as Theme), direction: 'rtl' }) as Theme,
    [outerTheme]
  );

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );

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

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentFilters, setCommentFilters] = useState({ status: false, isRemoved: false });

  const loadComments = async () => {
    if (!productId) return;
    setCommentsLoading(true);
    try {
      const res = await getProductComments({
        productId,
        status: commentFilters.status,
        isRemoved: commentFilters.isRemoved,
        pageIndex: 0,
      });
      if (res?.success) {
        setComments(res.result.productComments || []);
      } else {
        toast.error(res?.message || 'خطا در دریافت نظرات');
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت نظرات');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, commentFilters]);

  // داخل ProductDetailsPage، کنار بقیه‌ی state ها/هوک‌ها
  const { categories, categoriesLoading, refetchCategories } = GetCategoriesApi();

  // برای سینک شدن مقدار انتخابی با categoryId
  const selectedCategory =
    Array.isArray(categories) && categoryId !== ''
      ? (categories.find((c: any) => c?.id === Number(categoryId)) ?? null)
      : null;

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
            {/* <Tab label="سوال و جواب" /> */}
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
              <CardHeader
                title="دسته‌بندی"
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => refetchCategories && refetchCategories()}
                  >
                    تازه‌سازی
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Autocomplete
                    options={Array.isArray(categories) ? categories : []}
                    loading={!!categoriesLoading}
                    value={selectedCategory}
                    onChange={(_, val: any | null) => {
                      // اگر خالی شد، categoryId رو خالی کن؛ در غیر اینصورت id عددی
                      setCategoryId(val?.id ?? '');
                    }}
                    getOptionLabel={(opt: any) =>
                      (opt?.name ??
                        (typeof opt?.id !== 'undefined' ? String(opt.id) : '')) as string
                    }
                    isOptionEqualToValue={(opt: any, val: any) => opt?.id === val?.id}
                    noOptionsText="موردی یافت نشد"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="انتخاب دسته"
                        placeholder="نام دسته را جستجو کنید"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {categoriesLoading ? <CircularProgress size={18} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  {/* نمایش/ویرایش مستقیم شناسه (اختیاری برای شفافیت) */}
                  <TextField
                    label="شناسه دسته (CategoryId)"
                    type="number"
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    helperText="در صورت انتخاب از لیست، این مقدار به‌صورت خودکار تنظیم می‌شود."
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Q&A */}

          {/* Comments */}
          {tab === 3 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardHeader title="نظرات محصول" />
              <CardContent>
                <Stack spacing={2}>
                  {/* فیلترها */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant={commentFilters.status ? 'contained' : 'outlined'}
                      onClick={() =>
                        setCommentFilters((prev) => ({ ...prev, status: !prev.status }))
                      }
                    >
                      منتشر شده
                    </Button>
                    <Button
                      variant={commentFilters.isRemoved ? 'contained' : 'outlined'}
                      onClick={() =>
                        setCommentFilters((prev) => ({ ...prev, isRemoved: !prev.isRemoved }))
                      }
                    >
                      حذف شده
                    </Button>
                  </Stack>

                  {/* لیست کامنت‌ها */}
                  {commentsLoading ? (
                    <Typography>در حال بارگذاری...</Typography>
                  ) : comments.length === 0 ? (
                    <Typography>هیچ نظری وجود ندارد.</Typography>
                  ) : (
                    comments.map((c) => (
                      <Card key={c.commentId} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box flex={1}>
                              <Typography fontWeight={600}>{c.userName}</Typography>
                              <Typography>{c.text}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ثبت شده در: {formatFaDate(c.insertTime)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                color={c.status ? 'success' : 'warning'}
                                startIcon={c.status ? <CheckIcon /> : <CloseIcon />}
                                onClick={async () => {
                                  try {
                                    const res = await changeProductCommentStatus({
                                      commentId: c.commentId,
                                      status: !c.status,
                                    });
                                    if (res.success) {
                                      toast.success(res.message || 'تغییر وضعیت انجام شد');
                                      loadComments();
                                    } else {
                                      toast.error(res.message || 'خطا در تغییر وضعیت');
                                    }
                                  } catch (e: any) {
                                    toast.error(e?.message || 'خطا در تغییر وضعیت');
                                  }
                                }}
                              >
                                {c.status ? 'منتشر شده' : 'منتشر نشده'}
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
